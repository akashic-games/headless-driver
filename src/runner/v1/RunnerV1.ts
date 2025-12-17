import { setImmediate } from "node:timers/promises";
import { akashicEngine as g, gameDriver as gdr, pdi } from "engine-files-v1";
import type { RunnerStartParameters } from "../Runner";
import { Runner } from "../Runner";
import type { RunnerPointEvent } from "../types";
import { PlatformV1 } from "./platform/PlatformV1";

export type RunnerV1Game = g.Game;

export class RunnerV1 extends Runner {
	readonly engineVersion: string = "1";
	readonly g: typeof g = g;
	platform: PlatformV1 | null = null;
	fps: number | null = null;

	private driver: gdr.GameDriver | null = null;
	private running: boolean = false;

	async start(params?: RunnerStartParameters): Promise<RunnerV1Game | null> {
		let game: RunnerV1Game | null = null;
		const paused = !!params?.paused;

		try {
			game = await this.initGameDriver();
			if (!paused) {
				this.resume();
			}
		} catch (e) {
			this.onError(e);
		}

		return game;
	}

	stop(): void {
		if (this.driver) {
			this.driver.stopGame();
			this.driver = null;
		}

		this.stopTimekeeper();
		this.running = false;
	}

	pause(): void {
		if (this.platform == null) {
			this.errorTrigger.fire(new Error("Cannot call Runner#pause() before initialized"));
			return;
		}

		this.platform.pauseLoopers();
		this.stopTimekeeper();
		this.running = false;
	}

	resume(): void {
		if (this.platform == null) {
			this.errorTrigger.fire(new Error("Cannot call Runner#resume() before initialized"));
			return;
		}

		this.platform.resumeLoopers();
		this.startTimekeeper();
		this.running = true;
	}

	async step(): Promise<void> {
		if (this.fps == null || this.platform == null) {
			this.errorTrigger.fire(new Error("Cannot call Runner#step() before initialized"));
			return;
		}
		if (this.running) {
			this.errorTrigger.fire(new Error("Cannot call Runner#step() in running"));
			return;
		}

		this.timekeeper.advance(1000 / this.fps);
		this.platform.advanceLoopers(Math.ceil(1000 / this.fps));
		await setImmediate();
	}

	protected _stepMinimal(): void {
		if (this.fps == null || this.platform == null) {
			this.errorTrigger.fire(new Error("RunnerV1#_stepMinimal(): Cannot call Runner#step() before initialized"));
			return;
		}
		if (this.running) {
			this.errorTrigger.fire(new Error("RunnerV1#_stepMinimal(): Cannot call Runner#step() in running"));
			return;
		}
		// NOTE: 現状 PDI の API 仕様により this.step() では厳密なフレーム更新ができない。そこで、一フレームの 1/2 の時間で進行することでフレームが飛んでしまうことを防止する。
		this.platform.advanceLoopers(1000 / this.fps / 2);
	}

	async advance(ms: number): Promise<void> {
		if (this.fps == null || this.platform == null || this.driver == null) {
			this.errorTrigger.fire(new Error("Cannot call Runner#advance() before initialized"));
			return;
		}
		if (this.running) {
			this.errorTrigger.fire(new Error("Cannot call Runner#advance() in running"));
			return;
		}

		const { loopMode, skipThreshold } = this.driver.getLoopConfiguration();

		// NOTE: skip の通知タイミングを一度に制限するため skipThreshold を一時的に変更する。
		await this.changeGameDriverState({
			loopConfiguration: {
				loopMode,
				skipThreshold: Math.ceil(ms / this.fps) + 1
			}
		});

		this.advancePlatform(ms);

		await this.changeGameDriverState({
			loopConfiguration: {
				loopMode,
				skipThreshold
			}
		});

		// Platform を進行させるとアセット読み込み・AMFlow のコールバックなどの setImmediate() が実行されるが、
		// それらを Runner#advance() の完了タイミングで確実に処理するため、Runner#advance() の完了を setImmediate() で遅延させている。
		// ここを単純な Promise で返しても microtask queue に積まれるため、macrotask queue に積まれる setImmediate() の処理の完了を待つことはできない。
		// @see https://nodejs.org/en/learn/asynchronous-work/understanding-setimmediate
		await setImmediate();
	}

	changeGameDriverState(param: gdr.GameDriverInitializeParameterObject): Promise<void> {
		return new Promise((resolve, reject) => {
			if (!this.driver) {
				reject(new Error("Game is not started"));
				return;
			}
			this.driver.changeState(param, (err) => (err ? reject(err) : resolve()));
		});
	}

	firePointEvent(event: RunnerPointEvent): void {
		if (this.platform == null) {
			this.errorTrigger.fire(new Error("Cannot call Runner#firePointEvent() before initialized"));
			return;
		}

		let type: pdi.PointType;
		if (event.type === "down") {
			type = pdi.PointType.Down;
		} else if (event.type === "move") {
			type = pdi.PointType.Move;
		} else if (event.type === "up") {
			type = pdi.PointType.Up;
		} else {
			this.errorTrigger.fire(new Error(`RunnerV1#firePointEvent(): unknown event type: ${event.type}`));
			return;
		}
		this.platform.firePointEvent({
			type,
			identifier: event.identifier,
			offset: event.offset
		});
	}

	getPrimarySurface(): never {
		throw new Error("RunnerV1#getPrimarySurface(): Not supported");
	}

	private initGameDriver(): Promise<RunnerV1Game> {
		return new Promise<RunnerV1Game>((resolve, reject) => {
			if (this.driver) {
				this.driver.destroy();
				this.driver = null;
			}

			const player = {
				id: this.player ? this.player.id : undefined!, // TODO: g.Player#id を string | undefined に修正するまでの暫定措置
				name: this.player ? this.player.name : undefined
			};

			const executionMode = this.executionMode === "active" ? gdr.ExecutionMode.Active : gdr.ExecutionMode.Passive;

			this.platform = new PlatformV1({
				configurationBaseUrl: this.configurationBaseUrl,
				assetBaseUrl: this.assetBaseUrl,
				amflow: this.amflow,
				trusted: this.trusted,
				renderingMode: this.renderingMode,
				sendToExternalHandler: (data: any) => this.onSendedToExternal(data),
				errorHandler: (e) => this.onError(e),
				loadFileHandler: (url, encoding, callback) => this.loadFileHandler(url, encoding, callback)
			});
			this.pause();

			const driver = new gdr.GameDriver({
				platform: this.platform,
				player,
				errorHandler: (e) => this.onError(e)
			});

			this.driver = driver;
			let result: RunnerV1Game | null = null;
			// TODO: パラメータを外部から変更可能にする
			driver.initialize(
				{
					configurationUrl: this.configurationUrl,
					configurationBase: this.configurationBaseUrl,
					assetBase: this.assetBaseUrl,
					driverConfiguration: {
						playId: this.playId,
						playToken: this.playToken,
						executionMode
					},
					loopConfiguration: {
						loopMode: gdr.LoopMode.Realtime
					},
					gameArgs: this.gameArgs
				},
				(e: any) => {
					if (e) {
						reject(e);
						return;
					}
					if (!result) {
						// GameDriver の内部実装上ここに来ることはないはずだが念のため確認
						return reject(new Error("Game is null."));
					}
					driver.startGame();
					resolve(result);
				}
			);

			driver.gameCreatedTrigger.handle((game: RunnerV1Game) => {
				if (this.externalValue) {
					Object.keys(this.externalValue).forEach((key) => {
						game.external[key] = this.externalValue![key];
					});
				}
				this.fps = game.fps;
				result = game;
				return true;
			});
		});
	}

	private onSendedToExternal(data: any): void {
		this.sendToExternalTrigger.fire(data);
	}
}
