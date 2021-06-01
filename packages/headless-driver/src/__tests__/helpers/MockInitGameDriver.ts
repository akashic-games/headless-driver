import { akashicEngine as g, gameDriver as gdr } from "@akashic/headless-driver-runner-v3/lib/engineFiles";
import { PlatformV3 } from "@akashic/headless-driver-runner-v3/lib/platform/PlatformV3";

export type RunnerV3Game = g.Game;

// TODO: jenkins のみで renderer.spec.ts がタイミングにより失敗するため、`driver.startGame()` を実行しない mock 関数として使用する。
// renderer.spec 側で `runner.advanceUntil()` で処理を進められるよう `gameLoop#start()` のみ行っている。
// jenkins から Actions へ移行後は不要となるため削除する。
export function MockInitGameDriver(runnner: any): Promise<RunnerV3Game> {
	return new Promise<RunnerV3Game>((resolve, reject) => {
		if (runnner.driver) {
			runnner.driver.destroy();
			runnner.driver = null;
		}

		const player = {
			id: runnner.player ? runnner.player.id : undefined!, // TODO: g.Player#id を string | undefined に修正するまでの暫定措置
			name: runnner.player ? runnner.player.name : undefined
		};

		const executionMode = runnner.executionMode === "active" ? gdr.ExecutionMode.Active : gdr.ExecutionMode.Passive;

		runnner.platform = new PlatformV3({
			configurationBaseUrl: runnner.configurationBaseUrl,
			assetBaseUrl: runnner.assetBaseUrl,
			amflow: runnner.amflow,
			trusted: runnner.trusted,
			renderingMode: runnner.renderingMode,
			sendToExternalHandler: (data: any) => runnner.onSendedToExternal(data),
			errorHandler: (e) => runnner.onError(e),
			loadFileHandler: (url, callback) => runnner.loadFileHandler(url, callback)
		});

		const driver = new gdr.GameDriver({
			platform: runnner.platform,
			player,
			errorHandler: (e) => runnner.onError(e)
		});

		runnner.driver = driver;

		driver.initialize(
			{
				configurationUrl: runnner.configurationUrl,
				configurationBase: runnner.configurationBaseUrl,
				assetBase: runnner.assetBaseUrl,
				driverConfiguration: {
					playId: runnner.playId,
					playToken: runnner.playToken,
					executionMode
				},
				loopConfiguration: {
					loopMode: gdr.LoopMode.Realtime
				},
				gameArgs: runnner.gameArgs
			},
			(e: any) => {
				if (e) {
					reject(e);
					return;
				}
				driver._gameLoop?.start();
				resolve(driver._game!);
			}
		);
		driver.gameCreatedTrigger.addOnce((game: RunnerV3Game) => {
			runnner.fps = game.fps;
		});
	});
}
