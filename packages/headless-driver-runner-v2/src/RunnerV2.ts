import { akashicEngine as g, gameDriver as gdr, pdi } from "@akashic/engine-files";
import { Runner, RunnerPointEvent, RunnerStartParameters } from "@akashic/headless-driver-runner";
import { PlatformV2 } from "./platform/PlatformV2";

// eslint-disable-next-line @typescript-eslint/naming-convention
export type RunnerV2_g = typeof g;

export type RunnerV2Game = g.Game;

export class RunnerV2 extends Runner {
	readonly engineVersion: string = "2";
	readonly g: RunnerV2_g = g;
	platform: PlatformV2 | null = null;

	private driver: gdr.GameDriver | null = null;
	private fps: number | null = null;
	private running: boolean = false;

	async start(params?: RunnerStartParameters): Promise<RunnerV2Game | null> {
		let game: RunnerV2Game | null = null;
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
		this.running = false;
	}

	pause(): void {
		if (this.platform == null) {
			this.errorTrigger.fire(new Error("Cannot call Runner#pause() before initialized"));
			return;
		}

		this.platform.pauseLoopers();
		this.running = false;
	}

	resume(): void {
		if (this.platform == null) {
			this.errorTrigger.fire(new Error("Cannot call Runner#resume() before initialized"));
			return;
		}

		this.platform.resumeLoopers();
		this.running = true;
	}

	step(): void {
		if (this.fps == null || this.platform == null) {
			this.errorTrigger.fire(new Error("Cannot call Runner#step() before initialized"));
			return;
		}
		if (this.running) {
			this.errorTrigger.fire(new Error("Cannot call Runner#step() in running"));
			return;
		}

		this.platform.advanceLoopers(Math.ceil(1000 / this.fps));
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
		const delta = Math.ceil(1000 / this.fps);
		let progress = 0;
		while (progress <= ms) {
			// NOTE: game-driver の内部実装により Looper 経由で一度に進める時間に制限がある。
			// そのため一度に進める時間を fps に応じて分割する。
			this.platform.advanceLoopers(delta);
			progress += delta;
		}
		await this.changeGameDriverState({
			loopConfiguration: {
				loopMode,
				skipThreshold
			}
		});
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
			this.errorTrigger.fire(new Error(`RunnerV2#firePointEvent(): unknown event type: ${event.type}`));
			return;
		}
		this.platform.firePointEvent({
			type,
			identifier: event.identifier,
			offset: event.offset
		});
	}

	getPrimarySurface(): never {
		throw new Error("RunnerV2#getPrimarySurface(): Not supported");
	}

	protected _stepMinimal(): void {
		if (this.fps == null || this.platform == null) {
			this.errorTrigger.fire(new Error("RunnerV2#_stepHalf(): Cannot call Runner#step() before initialized"));
			return;
		}
		if (this.running) {
			this.errorTrigger.fire(new Error("RunnerV2#_stepHalf(): Cannot call Runner#step() in running"));
			return;
		}
		// NOTE: 現状 PDI の API 仕様により this.step() では厳密なフレーム更新ができない。そこで、一フレームの 1/2 の時間で進行することでフレームが飛んでしまうことを防止する。
		this.platform.advanceLoopers(1000 / this.fps / 2);
	}

	private initGameDriver(): Promise<RunnerV2Game> {
		return new Promise<RunnerV2Game>((resolve, reject) => {
			if (this.driver) {
				this.driver.destroy();
				this.driver = null;
			}

			const player = {
				id: this.player ? this.player.id : undefined!, // TODO: g.Player#id を string | undefined に修正するまでの暫定措置
				name: this.player ? this.player.name : undefined
			};

			const executionMode = this.executionMode === "active" ? gdr.ExecutionMode.Active : gdr.ExecutionMode.Passive;

			this.platform = new PlatformV2({
				configurationBaseUrl: this.configurationBaseUrl,
				assetBaseUrl: this.assetBaseUrl,
				amflow: this.amflow,
				trusted: this.trusted,
				renderingMode: this.renderingMode,
				sendToExternalHandler: (data: any) => this.onSendedToExternal(data),
				errorHandler: (e) => this.onError(e),
				loadFileHandler: (url, callback) => this.loadFileHandler(url, callback)
			});

			const driver = new gdr.GameDriver({
				platform: this.platform,
				player,
				errorHandler: (e) => this.onError(e)
			});

			this.driver = driver;
			let tmpGame: RunnerV2Game;
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
					this.pause();
					driver.startGame();
					resolve(tmpGame);
				}
			);

			driver.gameCreatedTrigger.addOnce((game: RunnerV2Game) => {
				if (this.externalValue) {
					Object.keys(this.externalValue).forEach((key) => {
						game.external[key] = this.externalValue![key];
					});
				}
				this.fps = game.fps;
				tmpGame = game;
			});
		});
	}

	private onSendedToExternal(data: any): void {
		this.sendToExternalTrigger.fire(data);
	}
}
