import * as assert from "assert";
import * as path from "path";
import * as http from "http-server";
import * as getPort from "get-port";
import * as url from "url";
import fetch from "node-fetch";

import { Permission, StartPoint, GetStartPointOptions } from "@akashic/amflow";
import { RunnerV1, RunnerV1Game } from "@akashic/headless-driver-runner-v1";
import { RunnerV2, RunnerV2Game } from "@akashic/headless-driver-runner-v2";

import { RunnerManager } from "../runner/RunnerManager";
import { PlayManager } from "../play/PlayManager";
import { AMFlowClient } from "../play/amflow/AMFlowClient";
import { setSystemLogger, SystemLogger } from "../Logger";
import { AMFlowClientManager } from "../play/AMFlowClientManager";
import { AMFlowStore } from "../play/amflow/AMFlowStore";

const host = "localhost";

// NOTE: テスト実行直前に動的に決定する
let baseUrl = "";
let contentUrlV1 = "";
let contentUrlV2 = "";
let contentUrlV2Cascade = "";

const mockServer = http.createServer({
	// TODO: src 以下から読み取っているのを何とかする
	root: path.resolve(__dirname, "..", "..", "src", "__tests__", "contents"),
	headers: {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Credentials": "true"
	}
});

const activePermission: Permission = {
	readTick: true,
	writeTick: true,
	sendEvent: true,
	subscribeEvent: true,
	subscribeTick: true,
	maxEventPriority: 2
};

const passivePermission: Permission = {
	readTick: true,
	writeTick: false,
	sendEvent: true,
	subscribeEvent: false,
	subscribeTick: false,
	maxEventPriority: 2
};

class SilentLogger implements SystemLogger {
	info(...messages: any[]): void {
		//
	}
	debug(...messages: any[]): void {
		//
	}
	warn(...messages: any[]): void {
		//
	}
	error(...messages: any[]): void {
		//
	}
}

setSystemLogger(new SilentLogger());

class MockRunnerManager extends RunnerManager {
	protected fetchContentUrl(contentUrl: string): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			fetch(contentUrl, { method: "GET" })
				.then(res => res.json())
				.then((config: any) => {
					if (config.content_url === "v1_content_url") {
						config.content_url = url.resolve(baseUrl, "content-v1/game.json");
					} else if (config.content_url === "v2_content_url") {
						config.content_url = url.resolve(baseUrl, "content-v2/game.json");
					} else if (config.content_url === "v2_content_cascade_url") {
						config.content_url = url.resolve(baseUrl, "content-v2/game.definitions.json");
					}
					if (config.asset_base_url === "v1_asset_base_url") {
						config.asset_base_url = url.resolve(baseUrl, "content-v1/");
					} else if (config.asset_base_url === "v2_asset_base_url") {
						config.asset_base_url = url.resolve(baseUrl, "content-v2/");
					}
					resolve(config);
				})
				.catch(e => reject(e));
		});
	}
}

before(async () => {
	const port = await getPort();
	baseUrl = `http://${host}:${port}`;
	contentUrlV1 = url.resolve(baseUrl, "content-v1/content.json");
	contentUrlV2 = url.resolve(baseUrl, "content-v2/content.json");
	contentUrlV2Cascade = url.resolve(baseUrl, "content-v2/content.cascade.json");
	mockServer.listen(port, host);
});

after(() => {
	mockServer.close();
});

describe("run-test", () => {
	it("各インスタンスを生成できる", async () => {
		const playManager = new PlayManager();
		const playId0 = await playManager.createPlay({
			contentUrl: contentUrlV2
		});
		assert.equal(playId0, "0");

		const amflow0 = playManager.createAMFlow(playId0);
		assert.equal(amflow0.playId, "0");

		const playToken0 = playManager.createPlayToken("0", activePermission);

		const runnerManager = new MockRunnerManager(playManager);
		const runnerId0 = await runnerManager.createRunner({
			playId: playId0,
			amflow: amflow0,
			playToken: playToken0,
			executionMode: "active"
		});
		const runner0 = runnerManager.getRunner(runnerId0);

		assert.equal(runner0.runnerId, "0");
		assert.equal(runner0.engineVersion, "2");

		const playId1 = await playManager.createPlay({
			contentUrl: contentUrlV2
		});
		assert.equal(playId1, "1");

		const amflow1 = playManager.createAMFlow(playId1);
		assert.equal(amflow1.playId, "1");

		const playToken1 = playManager.createPlayToken("1", activePermission);

		const runnerId1 = await runnerManager.createRunner({
			playId: playId1,
			amflow: amflow1,
			playToken: playToken1,
			executionMode: "active"
		});
		const runner1 = runnerManager.getRunner(runnerId1);

		assert.equal(runner1.runnerId, "1");
		assert.equal(runner0.engineVersion, "2");

		await runnerManager.startRunner("0");
		await runnerManager.stopRunner("0");
		assert.equal(runnerManager.getRunner("0") == null, true);

		playManager.stopPlay("0");
		assert.equal(playManager.getPlay("0") == null, true);

		const playId2 = await playManager.createPlay({
			contentUrl: contentUrlV2
		});
		assert.equal(playId2, "2");

		const amflow2 = playManager.createAMFlow(playId2);
		assert.equal(amflow2.playId, "2");

		const playToken2 = playManager.createPlayToken("2", activePermission);

		const runnerId2 = await runnerManager.createRunner({
			playId: playId2,
			amflow: amflow2,
			playToken: playToken2,
			executionMode: "active"
		});
		const runner2 = runnerManager.getRunner(runnerId2);
		assert.equal(runner2.runnerId, "2");
		assert.equal(runner2.engineVersion, "2");
	});

	it("AMFlow, playTokenの管理ができる", () => {
		const amflowClientManager = new AMFlowClientManager();

		const token1 = amflowClientManager.createPlayToken("0", activePermission);
		const authenticated1 = amflowClientManager.authenticatePlayToken("0", token1);
		assert.deepEqual(authenticated1, activePermission);
		assert.equal((amflowClientManager as any).playTokenMap["0"] != null, true);

		amflowClientManager.createAMFlow("0");
		const storeMap: Map<string, AMFlowStore> = (amflowClientManager as any).storeMap;
		assert.equal(storeMap.get("0") != null, true);

		const token2 = amflowClientManager.createPlayToken("1", activePermission);
		const authenticated2 = amflowClientManager.authenticatePlayToken("1", token2, true);
		assert.deepEqual(authenticated2, activePermission);

		amflowClientManager.createAMFlow("1");
		assert.equal(storeMap.get("1") != null, true);

		amflowClientManager.deleteAllPlayTokens("0");
		amflowClientManager.deleteAMFlowStore("0");
		assert.equal((amflowClientManager as any).playTokenMap["0"] == null, true);
		assert.equal(storeMap.get("0") == null, true);
	});

	it("AMFlow通信ができる", done => {
		const playManager = new PlayManager();
		let playId: string;
		let activeAMFlow: AMFlowClient;
		let passiveAMFlow: AMFlowClient;
		playManager
			.createPlay({
				contentUrl: contentUrlV2
			})
			.then(p => {
				playId = p;
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					activeAMFlow = playManager.createAMFlow(playId);
					activeAMFlow.open(playId, err => {
						if (err) {
							reject(err);
							return;
						}
						resolve();
					});
				});
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					passiveAMFlow = playManager.createAMFlow(playId);
					passiveAMFlow.open(playId, err => {
						if (err) {
							reject(err);
							return;
						}
						resolve();
					});
				});
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					// 認証できない
					passiveAMFlow.authenticate("dummy-token", (err, permission) => {
						if (err) {
							assert.equal(err instanceof Error, true);
							assert.equal(permission == null, true);
							resolve();
							return;
						}
						reject(new Error("認証できないはず"));
					});
				});
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					// 認証できる
					const playToken = playManager.createPlayToken(playId, passivePermission);
					passiveAMFlow.authenticate(playToken, (err, permission) => {
						if (err) {
							reject(err);
							return;
						}
						assert.deepEqual(permission, {
							readTick: true,
							writeTick: false,
							sendEvent: true,
							subscribeEvent: false,
							subscribeTick: false,
							maxEventPriority: 2
						});
						resolve();
					});
				});
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					// 認証できる
					const playToken = playManager.createPlayToken(playId, activePermission);
					activeAMFlow.authenticate(playToken, (err, permission) => {
						if (err) {
							reject(err);
							return;
						}
						assert.deepEqual(permission, {
							readTick: true,
							writeTick: true,
							sendEvent: true,
							subscribeEvent: true,
							subscribeTick: true,
							maxEventPriority: 2
						});
						resolve();
					});
				});
			})
			.then(() => {
				activeAMFlow.open(playId);
				passiveAMFlow.open(playId);
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					// Tick を送信できる
					activeAMFlow.sendTick([0]);

					// TickList を取得できる
					passiveAMFlow.getTickList(0, 1, (err, tickList) => {
						if (err) {
							reject(err);
							return;
						}
						assert.equal(err == null, true);
						assert.deepEqual(tickList, [0, 0, []]);
						resolve();
					});
				});
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					// Event の受信ハンドラを登録できる
					const eventHandler = (event: number[]) => {
						// Max Priority の確認
						assert.deepEqual(event, [0, 2, "dummy-player-id"]);
						activeAMFlow.offEvent(eventHandler);
						resolve();
					};
					activeAMFlow.onEvent(eventHandler);

					// Event を送信できる
					passiveAMFlow.sendEvent([0, 5, "dummy-player-id"]);
				});
			})
			.then(done)
			.catch(e => done(e));
	});
});

describe("AMFlow の動作テスト", () => {
	it("getStartPoint で正しく startPoint が取得できる", done => {
		const amflowClientManager = new AMFlowClientManager();
		const amflowClient = amflowClientManager.createAMFlow("0");
		amflowClient.open("0", () => {
			const token = amflowClientManager.createPlayToken("0", activePermission);
			amflowClient.authenticate(token, async () => {
				const getStartPoint: (opts?: GetStartPointOptions) => Promise<StartPoint> = opts =>
					new Promise<StartPoint>((resolve, reject) => {
						amflowClient.getStartPoint(opts, (e, data) => (e ? reject(e) : resolve(data)));
					});
				const putStartPoint: (sp: StartPoint) => Promise<StartPoint> = sp =>
					new Promise((resolve, reject) => {
						amflowClient.putStartPoint(sp, e => (e ? reject(e) : resolve()));
					});

				await putStartPoint({
					frame: 0,
					timestamp: 100,
					data: "frame0"
				});
				await putStartPoint({
					frame: 100,
					timestamp: 10000,
					data: "frame100"
				});
				await putStartPoint({
					frame: 500,
					timestamp: 50000,
					data: "frame500"
				});
				await putStartPoint({
					frame: 200,
					timestamp: 20000,
					data: "frame200"
				});

				// default: frame === 0
				const frame = await getStartPoint({});
				assert.equal(frame.data, "frame0");

				// only frame
				const frame0 = await getStartPoint({ frame: 0 });
				const frame100 = await getStartPoint({ frame: 100 });
				const frame700 = await getStartPoint({ frame: 700 });

				assert.equal(frame0.data, "frame0");
				assert.equal(frame100.data, "frame100");
				assert.equal(frame700.data, "frame500");

				// only timestamp
				const timestamp10000 = await getStartPoint({ timestamp: 10000 });
				const timestamp30000 = await getStartPoint({ timestamp: 30000 });
				const timestamp60000 = await getStartPoint({ timestamp: 60000 });

				assert.equal(timestamp10000.data, "frame100");
				assert.equal(timestamp30000.data, "frame200");
				assert.equal(timestamp60000.data, "frame500");

				// frame and timestamp
				const sp1 = await getStartPoint({ frame: 0, timestamp: 100 });
				const sp2 = await getStartPoint({ frame: 50, timestamp: 500 });
				const sp3 = await getStartPoint({ frame: 100, timestamp: 1000 });
				const sp4 = await getStartPoint({ frame: 1000, timestamp: 10000 });

				// 内容は関知しないが、エラーが発生しないことを確認
				assert.equal(sp1 != null, true);
				assert.equal(sp2 != null, true);
				assert.equal(sp3 != null, true);
				assert.equal(sp4 != null, true);

				// no startPoint
				try {
					await getStartPoint({ timestamp: 0 });
				} catch (e) {
					// no startPoint found
					assert.equal(e != null, true);
				}

				done();
			});
		});
	});
});

describe("コンテンツ動作テスト", () => {
	it("Akashic V1 のコンテンツが動作できる", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV1
		});

		const activeAMFlow = playManager.createAMFlow(playId);
		assert.equal(activeAMFlow.playId, playId);

		const playToken = playManager.createPlayToken(playId, activePermission);

		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active"
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV1;
		assert.equal(runner.runnerId, "0");
		assert.equal(runner.engineVersion, "1");

		const game = (await runnerManager.startRunner(runner.runnerId)) as RunnerV1Game;
		assert.equal(game.playId, playId);

		const handleLog = () =>
			new Promise<any>((resolve, reject) => {
				// コンテンツ側での g.Game#logger の出力を捕捉できる
				runner.logTrigger.handle((l: any) => {
					resolve(l);
					return true;
				});
			});

		const log = await handleLog();
		assert.equal(log.message, "reached right");

		const handleError = () =>
			new Promise<any>((resolve, reject) => {
				// コンテンツ側での g.Game#logger の出力を捕捉できる
				runner.logTrigger.handle((l: any) => {
					resolve(l);
					return true;
				});
			});

		// AMFlow 経由でイベントを送信でき、それをコンテンツで捕捉できる
		activeAMFlow.sendEvent([0x20, null, ":akashic", { hoge: "fuga" }]);

		// 読み込んだコンテンツ側で受信したメッセージイベントをログに出力しているので、ここで内容を取得する
		const event = await handleError();
		assert.deepEqual(event.message.data, { hoge: "fuga" });
		assert.equal(event.message.player.id, ":akashic");

		runner.stop();
	});

	it("Akashic V2 のコンテンツが動作できる", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV2
		});

		const activeAMFlow = playManager.createAMFlow(playId);
		assert.equal(activeAMFlow.playId, playId);

		const playToken = playManager.createPlayToken(playId, activePermission);

		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active"
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV2;
		assert.equal(runner.runnerId, "0");
		assert.equal(runner.engineVersion, "2");

		const game = (await runnerManager.startRunner(runner.runnerId)) as RunnerV2Game;
		assert.equal(game.playId, playId);

		const handleLog = () =>
			new Promise<any>((resolve, reject) => {
				// コンテンツ側での g.Game#logger の出力を捕捉できる
				runner.logTrigger.addOnce(l => {
					resolve(l);
				});
			});

		const log = await handleLog();
		assert.equal(log.message, "reached right");

		const handleEvent = () =>
			new Promise<any>((resolve, reject) => {
				// コンテンツ側での g.Game#logger の出力を捕捉できる
				runner.logTrigger.addOnce(l => {
					resolve(l);
				});
			});

		// AMFlow 経由でイベントを送信でき、それをコンテンツで捕捉できる
		activeAMFlow.sendEvent([0x20, null, ":akashic", { hoge: "fuga" }]);

		// 読み込んだコンテンツで受信したメッセージイベントをログに出力しているので、ここで内容を取得する
		const event = await handleEvent();
		assert.deepEqual(event.message.data, { hoge: "fuga" });
		assert.equal(event.message.player.id, ":akashic");
		runner.stop();
	});

	it("Passive で起動したコンテンツから Active で起動したコンテンツに対してメッセージを送信できる", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV2
		});

		const activeAMFlow = playManager.createAMFlow(playId);
		const passiveAMFlow = playManager.createAMFlow(playId);

		const activePlayToken = playManager.createPlayToken(playId, activePermission);
		const passivePlayToken = playManager.createPlayToken(playId, passivePermission);

		const runnerManager = new MockRunnerManager(playManager);
		const activeRunnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken: activePlayToken,
			executionMode: "active"
		});

		const passiveRunnerId = await runnerManager.createRunner({
			playId,
			amflow: passiveAMFlow,
			playToken: passivePlayToken,
			executionMode: "passive"
		});

		const activeRunner = runnerManager.getRunner(activeRunnerId) as RunnerV2;
		const passiveRunner = runnerManager.getRunner(passiveRunnerId) as RunnerV2;
		await runnerManager.startRunner(activeRunner.runnerId);
		await runnerManager.startRunner(passiveRunner.runnerId);

		// (1) AMFlow 経由で Passive のコンテンツにメッセージを送信させる
		passiveAMFlow.sendEvent([0x20, null, ":akashic", "send_event"]);

		// (2) (1) 送信後に Active 側のメッセージ受信ハンドラを登録
		// NOTE: "data_from_content" 以外のメッセージイベントの捕捉を防ぐため、このタイミングでログをハンドルする
		const handleLog = () =>
			new Promise<any>((resolve, reject) => {
				// NOTE: 読み込んだコンテンツ側で受信したメッセージイベントをログ出力しているので、ここで内容を取得する
				activeRunner.logTrigger.addOnce(l => {
					resolve(l);
				});
			});

		// (3) 受け取ったメッセージイベントの内容を確認
		const event = await handleLog();
		assert.equal(event.message.data.text, "data_from_content");

		activeRunner.stop();
		passiveRunner.stop();
	});

	it("akashic-sandbox のカスケードが正しく解釈できる", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV2Cascade
		});

		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);

		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active"
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV2;

		const handleLog = () =>
			new Promise<any>((resolve, reject) => {
				// コンテンツ側での g.Game#logger の出力を捕捉できる
				runner.logTrigger.addOnce(l => {
					resolve(l);
				});
			});

		await runner.start();

		const log = await handleLog();
		assert.equal(log.message, "reached right");
		runner.stop();
	});
});

describe("コンテンツ動作テスト: 異常系", () => {
	it("存在しない Content URL を指定すると Runner 起動に失敗する", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: "dummy-url"
		});
		assert.equal(playId, "0");

		const activeAMFlow = playManager.createAMFlow(playId);
		assert.equal(activeAMFlow.playId, "0");

		const playToken = playManager.createPlayToken(playId, activePermission);

		const runnerManager = new MockRunnerManager(playManager);
		try {
			// 存在しない URL なので起動に失敗する
			await runnerManager.createRunner({
				playId,
				amflow: activeAMFlow,
				playToken,
				executionMode: "active"
			});
			assert.fail();
		} catch (e) {
			assert.equal(e != null, true);
		}
	});

	it("Akashic V1 のコンテンツ内での例外を捕捉できる", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV1
		});

		const activeAMFlow = playManager.createAMFlow(playId);
		assert.equal(activeAMFlow.playId, playId);

		const playToken = playManager.createPlayToken(playId, activePermission);

		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active"
		});

		const runner = runnerManager.getRunner(runnerId) as RunnerV1;
		await runnerManager.startRunner(runnerId);

		const handleError = () =>
			new Promise<any>((resolve, reject) => {
				runner.errorTrigger.handle((e: any) => {
					resolve(e);
					return true;
				});
			});

		// AMFlow 経由でコンテンツに例外を投げさせる
		activeAMFlow.sendEvent([0x20, null, ":akashic", "throw_error"]);

		const error = await handleError();
		assert.equal(error.message, "unknown error");
		runner.stop();
	});

	it("Akashic V2 のコンテンツ内での例外を捕捉できる", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV2
		});

		const activeAMFlow = playManager.createAMFlow(playId);
		assert.equal(activeAMFlow.playId, playId);

		const playToken = playManager.createPlayToken(playId, activePermission);

		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active"
		});

		const runner = runnerManager.getRunner(runnerId) as RunnerV2;
		await runnerManager.startRunner(runner.runnerId);

		const handleError = () =>
			new Promise<any>((resolve, reject) => {
				runner.errorTrigger.add((e: any) => {
					resolve(e);
					return true;
				});
			});

		// AMFlow 経由でコンテンツに例外を投げさせる
		activeAMFlow.sendEvent([0x20, null, ":akashic", "throw_error"]);

		const error = await handleError();
		assert.equal(error.message, "unknown error");

		runner.stop();
	});
});
