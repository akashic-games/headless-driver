import { gameDriver as gdr } from "@akashic/engine-files";
import { Runner } from "@akashic/headless-driver-runner";
import { PlatformV2 } from "./platform/PlatformV2";
import { RunnerV2, RunnerV2Game } from "./RunnerV2";

export interface SandboxCallbackObject {
	game: RunnerV2Game;
	driver: gdr.GameDriver;
}

export class RunnerSandbox {
	private driver: gdr.GameDriver;
	private runner: RunnerV2;

	constructor(runner: RunnerV2) {
		this.runner = runner;
	}

	async start(): Promise<SandboxCallbackObject | null> {
		let game: RunnerV2Game | null = null;
		try {
			game = await this.initGameDriver();
		} catch (e) {
			throw e;
		}
		return { game: game, driver: this.driver };
	}

	private initGameDriver(): Promise<RunnerV2Game> {
		return new Promise<RunnerV2Game>((resolve, reject) => {
			if (this.driver) {
				this.driver.destroy();
				this.driver = null;
			}

			const _player = (this.runner as Runner).player;
			const player = {
				id: _player ? _player.id : undefined,
				name: _player ? _player.name : undefined
			};

			const platform = new PlatformV2({
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
			this.driver.gameCreatedTrigger.addOnce((game: RunnerV2Game) => {
				game._started.addOnce(() => {
					resolve(game);
				});
			});
		});
	}
}
