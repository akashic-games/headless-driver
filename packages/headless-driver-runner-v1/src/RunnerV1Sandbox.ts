import { gameDriver as gdr } from "@akashic/engine-files";
import { Runner } from "@akashic/headless-driver-runner";
import { PlatformV1 } from "./platform/PlatformV1";
import { RunnerV1, RunnerV1Game } from "./RunnerV1";

export interface SandboxCallbackObject {
	game: RunnerV1Game;
	driver: gdr.GameDriver;
}

export class RunnerSandbox {
	private driver: gdr.GameDriver;
	private runner: RunnerV1;

	constructor(runner: RunnerV1) {
		this.runner = runner;
	}

	async start(): Promise<SandboxCallbackObject | null> {
		let game: RunnerV1Game | null = null;
		try {
			game = await this.initGameDriver();
		} catch (e) {
			throw e;
		}
		return { game: game, driver: this.driver };
	}

	private initGameDriver(): Promise<RunnerV1Game> {
		return new Promise<RunnerV1Game>((resolve, reject) => {
			if (this.driver) {
				this.driver.destroy();
				this.driver = null;
			}

			const _player = (this.runner as Runner).player;
			const player = {
				id: _player ? _player.id : undefined,
				name: _player ? _player.name : undefined
			};

			const platform = new PlatformV1({
				configurationBaseUrl: this.runner.configurationBaseUrl,
				assetBaseUrl: this.runner.assetBaseUrl,
				amflow: this.runner.amflow,
				sendToExternalHandler: (data: any) => this.runner.onSended(data),
				errorHandler: (e: any) => this.runner.onErrorHandler(e)
			});

			this.driver = new gdr.GameDriver({
				platform: platform,
				player: player,
				errorHandler: (e: any) => this.runner.onErrorHandler(e)
			});

			const executionMode = this.runner.executionMode === "active" ? gdr.ExecutionMode.Active : gdr.ExecutionMode.Passive;
			// TODO: パラメータを外部から変更可能にする
			this.driver.initialize(
				{
					configurationUrl: this.runner.configurationUrl,
					configurationBase: this.runner.configurationBaseUrl,
					assetBase: this.runner.assetBaseUrl,
					driverConfiguration: {
						playId: this.runner.playId,
						playToken: this.runner.playToken,
						executionMode
					},
					loopConfiguration: {
						loopMode: gdr.LoopMode.Realtime
					},
					gameArgs: this.runner.gameArgs
				},
				(e: any) => {
					if (e) {
						reject(e);
						return;
					}
					this.driver.startGame();
				}
			);
			this.driver.gameCreatedTrigger.handle((game: RunnerV1Game) => {
				game._started.handle(() => {
					resolve(game);
				});
			});
		});
	}
}
