import { GetStartPointOptions, Permission, StartPoint } from "@akashic/amflow";
import { RunnerV1, RunnerV1Game } from "@akashic/headless-driver-runner-v1";
import { RunnerV2, RunnerV2Game } from "@akashic/headless-driver-runner-v2";
import { Event } from "@akashic/playlog";
import * as getPort from "get-port";
import * as http from "http";
import fetch from "node-fetch";
import * as path from "path";
import * as url from "url";
import { setSystemLogger, SystemLogger } from "../Logger";
import { AMFlowClient } from "../play/amflow/AMFlowClient";
import { AMFlowStore } from "../play/amflow/AMFlowStore";
import { BadRequestError, PermissionError } from "../play/amflow/ErrorFactory";
import { AMFlowClientManager } from "../play/AMFlowClientManager";
import { PlayManager } from "../play/PlayManager";
import { RunnerManager } from "../runner/RunnerManager";

const handler = require("serve-handler"); // tslint:disable-line:no-var-requires
const host = "localhost";

// NOTE: テスト実行直前に動的に決定する
let baseUrl = "";
let contentUrlV1 = "";
let contentUrlV2 = "";
let contentUrlV2Cascade = "";

const mockServer = http.createServer((request, response) => {
	return handler(request, response, {
		public: path.resolve(__dirname, "contents"),
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Credentials": "true"
		}
	});
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

beforeAll(async () => {
	const port = await getPort();
	baseUrl = `http://${host}:${port}`;
	contentUrlV1 = url.resolve(baseUrl, "content-v1/content.json");
	contentUrlV2 = url.resolve(baseUrl, "content-v2/content.json");
	contentUrlV2Cascade = url.resolve(baseUrl, "content-v2/content.cascade.json");
	mockServer.listen(port, host);
});

afterAll(() => {
	mockServer.close();
});

describe("run-test", () => {
	it("各インスタンスを生成できる", async () => {
		const playManager = new PlayManager();
		const playId0 = await playManager.createPlay({
			contentUrl: contentUrlV2
		});
		expect(playId0).toBe("0");

		const amflow0 = playManager.createAMFlow(playId0);
		expect(amflow0.playId).toBe("0");

		const playToken0 = playManager.createPlayToken("0", activePermission);

		const runnerManager = new MockRunnerManager(playManager);
		const runnerId0 = await runnerManager.createRunner({
			playId: playId0,
			amflow: amflow0,
			playToken: playToken0,
			executionMode: "active"
		});
		const runner0 = runnerManager.getRunner(runnerId0);

		expect(runner0.runnerId).toBe("0");
		expect(runner0.engineVersion).toBe("2");

		const playId1 = await playManager.createPlay({
			contentUrl: contentUrlV2
		});
		expect(playId1).toBe("1");

		const amflow1 = playManager.createAMFlow(playId1);
		expect(amflow1.playId).toBe("1");

		const playToken1 = playManager.createPlayToken("1", activePermission);

		const runnerId1 = await runnerManager.createRunner({
			playId: playId1,
			amflow: amflow1,
			playToken: playToken1,
			executionMode: "active"
		});
		const runner1 = runnerManager.getRunner(runnerId1);

		expect(runner1.runnerId).toBe("1");
		expect(runner0.engineVersion).toBe("2");

		await runnerManager.startRunner("0");
		await runnerManager.stopRunner("0");
		expect(runnerManager.getRunner("0")).toBe(null);

		playManager.deletePlay("0");
		expect(playManager.getPlay("0")).toBe(null);

		const playId2 = await playManager.createPlay({
			contentUrl: contentUrlV2
		});
		expect(playId2).toBe("2");

		const amflow2 = playManager.createAMFlow(playId2);
		expect(amflow2.playId).toBe("2");

		const playToken2 = playManager.createPlayToken("2", activePermission);

		const runnerId2 = await runnerManager.createRunner({
			playId: playId2,
			amflow: amflow2,
			playToken: playToken2,
			executionMode: "active"
		});
		const runner2 = runnerManager.getRunner(runnerId2);
		expect(runner2.runnerId).toBe("2");
		expect(runner2.engineVersion).toBe("2");
	});

	it("AMFlow, playTokenの管理ができる", () => {
		const amflowClientManager = new AMFlowClientManager();

		const token1 = amflowClientManager.createPlayToken("0", activePermission);
		const authenticated1 = amflowClientManager.authenticatePlayToken("0", token1);
		expect(authenticated1).toEqual(activePermission);
		expect((amflowClientManager as any).playTokenMap["0"]).not.toBe(null);

		amflowClientManager.createAMFlow("0");
		const storeMap: Map<string, AMFlowStore> = (amflowClientManager as any).storeMap;
		expect(storeMap.get("0")).not.toBe(null);

		const token2 = amflowClientManager.createPlayToken("1", activePermission);
		const authenticated2 = amflowClientManager.authenticatePlayToken("1", token2, true);
		expect(authenticated2).toEqual(activePermission);

		amflowClientManager.createAMFlow("1");
		expect(storeMap.get("1")).not.toBe(null);

		amflowClientManager.deleteAllPlayTokens("0");
		amflowClientManager.deleteAMFlowStore("0");
		expect((amflowClientManager as any).playTokenMap["0"]).toBeUndefined();
		expect(storeMap.get("0")).toBeUndefined();
	});

	it("Play の管理ができる", async () => {
		const playManager = new PlayManager();
		const playId1 = await playManager.createPlay({ contentUrl: contentUrlV2 });
		const playId2 = await playManager.createPlay({ contentUrl: contentUrlV2 });
		const playId3 = await playManager.createPlay({ contentUrl: contentUrlV2 });

		let playIds = playManager.getAllPlays().map(play => play.playId);
		expect(playIds).toEqual([playId1, playId2, playId3]);

		playManager.suspendPlay(playId1);

		// すべてのPlay
		playIds = playManager.getAllPlays().map(play => play.playId);
		expect(playIds).toEqual([playId1, playId2, playId3]);
		// running の Play
		playIds = playManager.getPlays({ status: "running" }).map(play => play.playId);
		expect(playIds).toEqual([playId2, playId3]);
		// suspend の Play
		playIds = playManager.getPlays({ status: "suspending" }).map(play => play.playId);
		expect(playIds).toEqual([playId1]);

		playManager.deletePlay(playId2);

		// すべてのPlay
		playIds = playManager.getAllPlays().map(play => play.playId);
		expect(playIds).toEqual([playId1, playId3]);
		// running の Play
		playIds = playManager.getPlays({ status: "running" }).map(play => play.playId);
		expect(playIds).toEqual([playId3]);
		// suspend の Play
		playIds = playManager.getPlays({ status: "suspending" }).map(play => play.playId);
		expect(playIds).toEqual([playId1]);

		playManager.resumePlay(playId1);

		// すべてのPlay
		playIds = playManager.getAllPlays().map(play => play.playId);
		expect(playIds).toEqual([playId1, playId3]);
		// running の Play
		playIds = playManager.getPlays({ status: "running" }).map(play => play.playId);
		expect(playIds).toEqual([playId1, playId3]);
		// suspend の Play
		playIds = playManager.getPlays({ status: "suspending" }).map(play => play.playId);
		expect(playIds).toEqual([]);
	});

	it("AMFlow通信ができる", done => {
		const playManager = new PlayManager();
		let playId: string;
		let activeAMFlow: AMFlowClient;
		let passiveAMFlow: AMFlowClient;
		let failureAMFlow: AMFlowClient;
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
					failureAMFlow = playManager.createAMFlow(playId);
					failureAMFlow.open(playId, err => {
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
							expect(err instanceof Error).toBe(true);
							expect(permission).toBe(null);
							expect(err.name).toBe("InvalidStatus");
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
						expect(permission).toEqual({
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
						expect(permission).toEqual({
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
				return new Promise((resolve, reject) => {
					// Tick を送信できる
					activeAMFlow.sendTick([0]);

					// TickList を取得できる
					passiveAMFlow.getTickList(0, 1, (err, tickList) => {
						if (err) {
							reject(err);
							return;
						}
						expect(err).toBe(null);
						expect(tickList).toEqual([0, 0, []]);
						resolve();
					});
				});
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					// Event の受信ハンドラを登録できる
					const eventHandler = (event: number[]) => {
						// Max Priority の確認
						expect(event).toEqual([0, 2, "dummy-player-id"]);
						activeAMFlow.offEvent(eventHandler);
						resolve();
					};
					activeAMFlow.onEvent(eventHandler);

					// Event を送信できる
					passiveAMFlow.sendEvent([0, 5, "dummy-player-id"]);
				});
			})
			.then(() => {
				return playManager.suspendPlay(playId);
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					// suspend 時に write, send 権限を含む permission は認証できない
					const playToken = playManager.createPlayToken(playId, activePermission);
					failureAMFlow.authenticate(playToken, (err, permission) => {
						if (err) {
							expect(err instanceof PermissionError).toBe(true);
							resolve();
							return;
						}
						reject(new Error("認証できないはず"));
					});
				});
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					// Play を suspend した後でも TickList を取得できる
					passiveAMFlow.getTickList(0, 1, (err, tickList) => {
						if (err) {
							reject(err);
							return;
						}
						expect(tickList).toEqual([0, 0, []]);
						resolve();
					});
				});
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					// Play を suspend した後に sendTick することはできない
					try {
						activeAMFlow.sendTick([1]);
						reject("Must throw error");
					} catch (e) {
						expect(e instanceof BadRequestError).toBe(true);
					}
					// Play を suspend した後に sendEvent することはできない
					try {
						passiveAMFlow.sendEvent([0, 1, "dummy-player-id"]);
						reject("Must throw error");
					} catch (e) {
						expect(e instanceof BadRequestError).toBe(true);
					}
					// Play を suspend した後に putStartPoint することはできない
					activeAMFlow.putStartPoint(
						{
							frame: 10,
							timestamp: 1000,
							data: "hoge"
						},
						e => {
							if (e) {
								expect(e instanceof BadRequestError).toBe(true);
								resolve();
							}
							reject("Must throw error");
						}
					);
				});
			})
			.then(() => {
				return playManager.resumePlay(playId);
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					// Play を resume した後に sendTick できる
					activeAMFlow.sendTick([1]);
					// Play を resume した後に sendEvent できる
					passiveAMFlow.sendEvent([0, 1, "dummy-player-id"]);
					// Play を resume した後に putStartPoint できる
					activeAMFlow.putStartPoint(
						{
							frame: 10,
							timestamp: 1000,
							data: "hoge"
						},
						e => {
							if (e) {
								reject(e);
								return;
							}
							resolve();
						}
					);
				});
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					// Play を resume した後に TickList を取得できる
					passiveAMFlow.getTickList(0, 1, (err, tickList) => {
						if (err) {
							reject(err);
							return;
						}
						expect(tickList).toEqual([0, 1, []]);
						resolve();
					});
				});
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					// resume 後に write, send 権限を含む permission が認証できる
					const playToken = playManager.createPlayToken(playId, activePermission);
					failureAMFlow.authenticate(playToken, (err, permission) => {
						if (err) {
							reject(err);
							return;
						}
						resolve();
					});
				});
			})
			.then(() => playManager.deletePlay(playId))
			.then(() => {
				return new Promise((resolve, reject) => {
					// すでに delete したプレーの AMFlowClient に対して close() を呼び出しても問題ない
					passiveAMFlow.close(err => (err ? reject(err) : resolve()));
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
				const getStartPoint: (opts: GetStartPointOptions) => Promise<StartPoint> = opts =>
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
				expect(frame.data).toBe("frame0");

				// only frame
				const frame0 = await getStartPoint({ frame: 0 });
				const frame100 = await getStartPoint({ frame: 100 });
				const frame700 = await getStartPoint({ frame: 700 });

				expect(frame0.data).toBe("frame0");
				expect(frame100.data).toBe("frame100");
				expect(frame700.data).toBe("frame500");

				// only timestamp
				const timestamp10000 = await getStartPoint({ timestamp: 10000 });
				const timestamp30000 = await getStartPoint({ timestamp: 30000 });
				const timestamp60000 = await getStartPoint({ timestamp: 60000 });

				expect(timestamp10000.data).toBe("frame100");
				expect(timestamp30000.data).toBe("frame200");
				expect(timestamp60000.data).toBe("frame500");

				// frame and timestamp
				const sp1 = await getStartPoint({ frame: 0, timestamp: 100 });
				const sp2 = await getStartPoint({ frame: 50, timestamp: 500 });
				const sp3 = await getStartPoint({ frame: 100, timestamp: 1000 });
				const sp4 = await getStartPoint({ frame: 1000, timestamp: 10000 });

				// 内容は関知しないが、エラーが発生しないことを確認
				expect(sp1).not.toBe(null);
				expect(sp2).not.toBe(null);
				expect(sp3).not.toBe(null);
				expect(sp4).not.toBe(null);

				// no startPoint
				try {
					await getStartPoint({ timestamp: 0 });
					fail("Must throw error");
				} catch (e) {
					// no startPoint found
					expect(e.message).toBe("No start point");
				}

				done();
			});
		});
	});

	it("AMFlow#onEvent が登録されるより以前の Event を正しく取得できる", done => {
		const playManager = new PlayManager();
		let activeAMFlow: AMFlowClient;
		let passiveAMFlow: AMFlowClient;
		let playId: string;
		const events: Event[] = [];
		playManager
			.createPlay({
				contentUrl: contentUrlV2
			})
			.then(p => {
				return new Promise((resolve, reject) => {
					playId = p;
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
					// 認証できる
					const playToken = playManager.createPlayToken(playId, passivePermission);
					passiveAMFlow.authenticate(playToken, err => {
						if (err) {
							reject(err);
							return;
						}
						resolve();
					});
				});
			})
			.then(() => {
				// active の AMFlow#authenticate(), AMFlow#onEvent() 呼び出し前にイベントを送信
				passiveAMFlow.sendEvent([0x20, 0, null, { ordinal: 1, hoge: "fuga" }]);
				passiveAMFlow.sendEvent([0x20, 0, null, { ordinal: 2, foo: "bar" }]);
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					// Active の認証
					const playToken = playManager.createPlayToken(playId, activePermission);
					activeAMFlow.authenticate(playToken, err => {
						if (err) {
							reject(err);
							return;
						}
						resolve();
					});
				});
			})
			.then(() => {
				activeAMFlow.onEvent(event => {
					events.push(event);
				});
			})
			.then(() => {
				// active の AMFlow#onEvent() 呼び出し後にイベントを送信
				passiveAMFlow.sendEvent([0x20, 0, null, { ordinal: 3 }]);
				passiveAMFlow.sendEvent([0x20, 0, null, { ordinal: 4 }]);
			})
			.then(() => {
				expect(events).toEqual([
					[0x20, 0, null, { ordinal: 1, hoge: "fuga" }],
					[0x20, 0, null, { ordinal: 2, foo: "bar" }],
					[0x20, 0, null, { ordinal: 3 }],
					[0x20, 0, null, { ordinal: 4 }]
				]);
			})
			.then(done)
			.catch(e => done(e));
	});
});

describe("コンテンツ動作テスト", () => {
	it("Akashic V1 のコンテンツが動作できる", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV1
		});

		const activeAMFlow = playManager.createAMFlow(playId);
		expect(activeAMFlow.playId).toBe(playId);

		const playToken = playManager.createPlayToken(playId, activePermission);

		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active"
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV1;
		expect(runner.runnerId).toBe("0");
		expect(runner.engineVersion).toBe("1");

		const game = (await runnerManager.startRunner(runner.runnerId)) as RunnerV1Game;
		expect(game.playId).toBe(playId);

		const handleData = () =>
			new Promise<any>((resolve, reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.handle((l: any) => {
					resolve(l);
					return true;
				});
			});

		const data = await handleData();
		expect(data).toBe("reached right");

		const handleError = () =>
			new Promise<any>((resolve, reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.handle((l: any) => {
					resolve(l);
					return true;
				});
			});

		// AMFlow 経由でイベントを送信でき、それをコンテンツで捕捉できる
		activeAMFlow.sendEvent([0x20, null, ":akashic", { hoge: "fuga" }]);

		// 読み込んだコンテンツ側で受信したメッセージイベントを出力しているので、ここで内容を取得する
		const event = await handleError();
		expect(event.data).toEqual({ hoge: "fuga" });
		expect(event.player.id).toBe(":akashic");

		runner.stop();
	});

	it("Akashic V2 のコンテンツが動作できる", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV2
		});

		const activeAMFlow = playManager.createAMFlow(playId);
		expect(activeAMFlow.playId).toBe(playId);

		const playToken = playManager.createPlayToken(playId, activePermission);

		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active"
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV2;
		expect(runner.runnerId).toBe("0");
		expect(runner.engineVersion).toBe("2");

		const game = (await runnerManager.startRunner(runner.runnerId)) as RunnerV2Game;
		expect(game.playId).toBe(playId);

		const handleData = () =>
			new Promise<any>((resolve, reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.addOnce(l => {
					resolve(l);
				});
			});

		const data = await handleData();
		expect(data).toBe("reached right");

		const handleEvent = () =>
			new Promise<any>((resolve, reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.addOnce(l => {
					resolve(l);
				});
			});

		// AMFlow 経由でイベントを送信でき、それをコンテンツで捕捉できる
		activeAMFlow.sendEvent([0x20, null, ":akashic", { hoge: "fuga" }]);

		// 読み込んだコンテンツで受信したメッセージイベントを出力しているので、ここで内容を取得する
		const event = await handleEvent();
		expect(event.data).toEqual({ hoge: "fuga" });
		expect(event.player.id).toBe(":akashic");
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
		// NOTE: "data_from_content" 以外のメッセージイベントの捕捉を防ぐため、このタイミングで出力をハンドルする
		const handleData = () =>
			new Promise<any>((resolve, reject) => {
				// NOTE: 読み込んだコンテンツ側で受信したメッセージイベントを出力しているので、ここで内容を取得する
				activeRunner.sendToExternalTrigger.addOnce(l => {
					resolve(l);
				});
			});

		// (3) 受け取ったメッセージイベントの内容を確認
		const event = await handleData();
		expect(event.data.text).toBe("data_from_content");

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

		const handleData = () =>
			new Promise<any>((resolve, reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.addOnce(l => {
					resolve(l);
				});
			});

		await runner.start();

		const data = await handleData();
		expect(data).toBe("reached right");
		runner.stop();
	});
});

describe("コンテンツ動作テスト: 異常系", () => {
	it("存在しない Content URL を指定すると Runner 起動に失敗する", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: "dummy-url"
		});
		expect(playId).toBe("0");

		const activeAMFlow = playManager.createAMFlow(playId);
		expect(activeAMFlow.playId).toBe("0");

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
			fail();
		} catch (e) {
			expect(e).not.toBe(null);
		}
	});

	it("Akashic V1 のコンテンツ内での例外を捕捉できる", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV1
		});

		const activeAMFlow = playManager.createAMFlow(playId);
		expect(activeAMFlow.playId).toBe(playId);

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
		expect(error.message).toBe("unknown error");
		runner.stop();
	});

	it("Akashic V2 のコンテンツ内での例外を捕捉できる", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV2
		});

		const activeAMFlow = playManager.createAMFlow(playId);
		expect(activeAMFlow.playId).toBe(playId);

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
		expect(error.message).toBe("unknown error");

		runner.stop();
	});
});
