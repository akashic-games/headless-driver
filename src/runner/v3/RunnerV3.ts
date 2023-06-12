/** @ts-ignore */
import { PlatformButtonType } from "@akashic/pdi-types";
import type { Canvas } from "canvas";
import type { RunnerStartParameters } from "../Runner";
import { Runner } from "../Runner";
import type { RunnerPointEvent } from "../types";
import { akashicEngine as g, gameDriver as gdr } from "./engineFiles";
import type { NodeCanvasSurface } from "./platform/graphics/canvas/NodeCanvasSurface";
import type { NullSurface } from "./platform/graphics/null/NullSurface";
import { PlatformV3 } from "./platform/PlatformV3";

export type RunnerV3Game = g.Game;

export class RunnerV3 extends Runner {
	readonly engineVersion: string = "3";
	readonly g: typeof g = g;
	platform: PlatformV3 | null = null;

	private driver: gdr.GameDriver | null = null;
	private fps: number | null = null;
	private running: boolean = false;

	async start(params?: RunnerStartParameters): Promise<RunnerV3Game | null> {
		let game: RunnerV3Game | null = null;
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

		this.platform.stepLoopers();
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

		const loopConfiguration = this.driver.getLoopConfiguration();

		if (!loopConfiguration) {
			this.errorTrigger.fire(new Error("Cannot get LoopConfiguration"));
			return;
		}

		const { loopMode, skipThreshold } = loopConfiguration;

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

		let type: g.PlatformPointType;
		if (event.type === "down") {
			type = g.PlatformPointType.Down;
		} else if (event.type === "move") {
			type = g.PlatformPointType.Move;
		} else if (event.type === "up") {
			type = g.PlatformPointType.Up;
		} else {
			this.errorTrigger.fire(new Error(`RunnerV3#firePointEvent(): unknown event type: ${event.type}`));
			return;
		}
		this.platform.firePointEvent({
			type,
			identifier: event.identifier,
			offset: event.offset,
			button: event.button ?? PlatformButtonType.Primary
		});
	}

	/**
	 * プライマリサーフェスを取得する。
	 * @returns NullSurface または NodeCanvasSurface
	 */
	getPrimarySurface(): NullSurface | NodeCanvasSurface {
		if (!this.platform) {
			throw new Error("RunnerV3#getPrimarySurface(): Platform has not been initialized");
		}
		if (this.renderingMode === "canvas") {
			return this.platform.getPrimarySurface() as NodeCanvasSurface;
		}

		return this.platform.getPrimarySurface() as NullSurface;
	}

	/**
	 * プライマリサーフェスの Canvas インスタンスを取得する。
	 * @returns node-canvas の Canvas
	 */
	getPrimarySurfaceCanvas(): Canvas {
		if (this.renderingMode !== "canvas") {
			throw Error("RunnerV3#getPrimarySurface(): Not supported except in the case of renderingMode === 'canvas");
		}
		return this.getPrimarySurface()._drawable;
	}

	protected _stepMinimal(): void {
		this.step();
	}

	private initGameDriver(): Promise<RunnerV3Game> {
		return new Promise<RunnerV3Game>((resolve, reject) => {
			if (this.driver) {
				this.driver.destroy();
				this.driver = null;
			}

			const player = {
				id: this.player ? this.player.id : undefined!, // TODO: g.Player#id を string | undefined に修正するまでの暫定措置
				name: this.player ? this.player.name : undefined
			};

			const executionMode = this.executionMode === "active" ? gdr.ExecutionMode.Active : gdr.ExecutionMode.Passive;

			this.platform = new PlatformV3({
				configurationBaseUrl: this.configurationBaseUrl,
				assetBaseUrl: this.assetBaseUrl,
				amflow: this.amflow,
				trusted: this.trusted,
				renderingMode: this.renderingMode,
				sendToExternalHandler: (data: any) => this.onSendedToExternal(data),
				errorHandler: (e) => this.onError(e),
				loadFileHandler: (url, callback) => this.loadFileHandler(url, callback)
			});
			this.pause();

			const driver = new gdr.GameDriver({
				platform: this.platform,
				player,
				errorHandler: (e) => this.onError(e)
			});

			this.driver = driver;
			let result: RunnerV3Game | null = null;
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

			driver.gameCreatedTrigger.addOnce((game: RunnerV3Game) => {
				if (this.externalValue) {
					Object.keys(this.externalValue).forEach((key) => {
						game.external[key] = this.externalValue![key];
					});
				}
				this.fps = game.fps;
				result = game;
			});
		});
	}

	private onSendedToExternal(data: any): void {
		this.sendToExternalTrigger.fire(data);
	}
}
