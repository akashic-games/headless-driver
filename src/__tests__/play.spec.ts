import * as path from "path";
import type { GetTickListOptions, StartPoint } from "@akashic/amflow";
import type { Event, TickList } from "@akashic/playlog";
import * as ExecuteVmScriptV3 from "../ExecuteVmScriptV3";
import { setSystemLogger } from "../Logger";
import type { AMFlowClient } from "../play/amflow/AMFlowClient";
import { BadRequestError, PermissionError } from "../play/amflow/ErrorFactory";
import type { DumpedPlaylog } from "../play/amflow/types";
import { PlayManager } from "../play/PlayManager";
import { activePermission, passivePermission } from "./constants";
import { MockRunnerManager } from "./helpers/MockRunnerManager";
import { SilentLogger } from "./helpers/SilentLogger";

setSystemLogger(new SilentLogger());

const contentUrl = process.env.CONTENT_URL_V3!;

beforeAll(() => {
	jest.spyOn(ExecuteVmScriptV3, "getFilePath").mockReturnValue(path.resolve(__dirname, "../../lib/", "ExecuteVmScriptV3.js"));
});

describe("プレイ周りの結合動作テスト", () => {
	it("各インスタンスを生成できる", async () => {
		const playManager = new PlayManager();
		const playId0 = await playManager.createPlay({
			contentUrl
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
			executionMode: "active",
			allowedUrls: null
		});
		const runner0 = runnerManager.getRunner(runnerId0)!;

		expect(runner0.runnerId).toBe("0");
		expect(runner0.engineVersion).toBe("3");

		const playId1 = await playManager.createPlay({
			contentUrl
		});
		expect(playId1).toBe("1");

		const amflow1 = playManager.createAMFlow(playId1);
		expect(amflow1.playId).toBe("1");

		const playToken1 = playManager.createPlayToken("1", activePermission);

		const runnerId1 = await runnerManager.createRunner({
			playId: playId1,
			amflow: amflow1,
			playToken: playToken1,
			executionMode: "active",
			allowedUrls: null
		});
		const runner1 = runnerManager.getRunner(runnerId1)!;

		expect(runner1.runnerId).toBe("1");
		expect(runner0.engineVersion).toBe("3");

		await runnerManager.startRunner("0");
		await runnerManager.stopRunner("0");
		expect(runnerManager.getRunner("0")).toBe(null);

		playManager.deletePlay("0");
		expect(playManager.getPlay("0")).toBe(null);

		const playId2 = await playManager.createPlay({
			contentUrl
		});
		expect(playId2).toBe("2");

		const amflow2 = playManager.createAMFlow(playId2);
		expect(amflow2.playId).toBe("2");

		const playToken2 = playManager.createPlayToken("2", activePermission);

		const runnerId2 = await runnerManager.createRunner({
			playId: playId2,
			amflow: amflow2,
			playToken: playToken2,
			executionMode: "active",
			allowedUrls: null
		});
		const runner2 = runnerManager.getRunner(runnerId2)!;
		expect(runner2.runnerId).toBe("2");
		expect(runner2.engineVersion).toBe("3");
	});

	it("AMFlow 通信ができる", (done) => {
		const playManager = new PlayManager();
		let playId: string;
		let activeAMFlow: AMFlowClient;
		let passiveAMFlow: AMFlowClient;
		let failureAMFlow: AMFlowClient;
		playManager
			.createPlay({
				contentUrl: "dummy"
			})
			.then((p) => {
				playId = p;
			})
			.then(() => {
				return new Promise<void>((resolve, reject) => {
					activeAMFlow = playManager.createAMFlow(playId);
					activeAMFlow.open(playId, (err) => {
						if (err) {
							reject(err);
							return;
						}
						resolve();
					});
				});
			})
			.then(() => {
				return new Promise<void>((resolve, reject) => {
					passiveAMFlow = playManager.createAMFlow(playId);
					passiveAMFlow.open(playId, (err) => {
						if (err) {
							reject(err);
							return;
						}
						resolve();
					});
				});
			})
			.then(() => {
				return new Promise<void>((resolve, reject) => {
					failureAMFlow = playManager.createAMFlow(playId);
					failureAMFlow.open(playId, (err) => {
						if (err) {
							reject(err);
							return;
						}
						resolve();
					});
				});
			})
			.then(() => {
				return new Promise<void>((resolve, reject) => {
					// 認証できない
					passiveAMFlow.authenticate("dummy-token", (err, permission) => {
						if (err) {
							expect(err instanceof Error).toBe(true);
							expect(permission).toBe(undefined);
							expect(err.name).toBe("InvalidStatus");
							resolve();
							return;
						}
						reject(new Error("認証できないはず"));
					});
				});
			})
			.then(() => {
				return new Promise<void>((resolve, reject) => {
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
				return new Promise<void>((resolve, reject) => {
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
			.then(async () => {
				// EventFlags を含む Tick を送信できる
				activeAMFlow.sendTick([0]);
				activeAMFlow.sendTick([
					1,
					[
						[0, 0b01000, "dummy-1-1"], // transient
						[1, 0b00010, "dummy-1-2"],
						[2, 0b01111, "dummy-1-3"] // transient
					]
				]);
				activeAMFlow.sendTick([2]);
				activeAMFlow.sendTick([
					3,
					[
						[0, 0b01000, "dummy-2-1"], // transient
						[1, 0b01010, "dummy-2-2"], // transient
						[2, 0b11111, "dummy-2-3"] // transient & ignorable
					]
				]);
				activeAMFlow.sendTick([4]);
				activeAMFlow.sendTick([
					5,
					[
						[0, 0b10000, "dummy-3-1"], // ignorable
						[1, 0b10010, "dummy-3-2"], // ignorable
						[2, 0b00111, "dummy-3-3"]
					]
				]);
				activeAMFlow.sendTick([6, [[0, 0b00000, "dummy-4-1"]]]);

				const getTickListLegacy = (begin: number, end: number): Promise<TickList> =>
					new Promise<TickList>((res, rej) => {
						// NOTE: 非推奨の引数による動作確認
						passiveAMFlow.getTickList(begin, end, (err, ticks) => (err ? rej(err) : res(ticks!)));
					});

				const getTickList = (opts: GetTickListOptions): Promise<TickList> =>
					new Promise<TickList>((res, rej) => {
						passiveAMFlow.getTickList(opts, (err, ticks) => (err ? rej(err) : res(ticks!)));
					});

				// 非推奨の引数でも TickList を取得できることを確認
				expect(await getTickListLegacy(0, 10)).toEqual([
					0,
					6,
					[
						[1, [[1, 0b00010, "dummy-1-2"]]],
						[3, []],
						[
							5,
							[
								[0, 0b10000, "dummy-3-1"],
								[1, 0b10010, "dummy-3-2"],
								[2, 0b00111, "dummy-3-3"]
							]
						],
						[6, [[0, 0b00000, "dummy-4-1"]]]
					]
				]);

				// 部分的に TickList を取得できる
				expect(await getTickList({ begin: 3, end: 5 })).toEqual([3, 4, [[3, []]]]);

				// すべての TickList を取得できる
				const unfilteredTickList = await getTickList({ begin: 0, end: 10 });

				expect(unfilteredTickList).toEqual([
					0,
					6,
					[
						[1, [[1, 0b00010, "dummy-1-2"]]],
						[3, []],
						[
							5,
							[
								[0, 0b10000, "dummy-3-1"],
								[1, 0b10010, "dummy-3-2"],
								[2, 0b00111, "dummy-3-3"]
							]
						],
						[6, [[0, 0b00000, "dummy-4-1"]]]
					]
				]);

				// すべての TickList を取得できる
				expect(
					await getTickList({
						begin: 0,
						end: 10,
						excludeEventFlags: {}
					})
				).toEqual(unfilteredTickList);

				// すべての TickList を取得できる
				expect(
					await getTickList({
						begin: 0,
						end: 10,
						excludeEventFlags: {
							ignorable: false
						}
					})
				).toEqual(unfilteredTickList);

				// Ignorable Event を除外した TickList を取得できる
				expect(
					await getTickList({
						begin: 0,
						end: 10,
						excludeEventFlags: {
							ignorable: true
						}
					})
				).toEqual([
					0,
					6,
					[
						[1, [[1, 0b00010, "dummy-1-2"]]],
						[3, []],
						[5, [[2, 0b00111, "dummy-3-3"]]],
						[6, [[0, 0b00000, "dummy-4-1"]]]
					]
				]);
			})
			.then(() => {
				return new Promise<void>((resolve, _reject) => {
					// Event の受信ハンドラを登録できる
					const eventHandler = (event: number[]): void => {
						// Max Priority の確認
						expect(event).toEqual([0, 2, "dummy-player-id"]);
						activeAMFlow.offEvent(eventHandler);
						resolve();
					};
					activeAMFlow.onEvent(eventHandler);

					// Event を送信できる
					passiveAMFlow.sendEvent([0, 0b011, "dummy-player-id"]);
				});
			})
			.then(() => {
				return new Promise<void>((resolve, _reject) => {
					// Event の受信ハンドラを登録できる
					const eventHandler = (event: number[]): void => {
						// Transient および Max Priority の確認
						expect(event).toEqual([0, 0b1000 | 0b0010, "dummy-player-id"]);
						activeAMFlow.offEvent(eventHandler);
						resolve();
					};
					activeAMFlow.onEvent(eventHandler);

					// Transient Event を送信できる
					passiveAMFlow.sendEvent([0, 0b1111, "dummy-player-id"]);
				});
			})
			.then(() => {
				return playManager.suspendPlay(playId);
			})
			.then(() => {
				return new Promise<void>((resolve, reject) => {
					// suspend 時に write, send 権限を含む permission は認証できない
					const playToken = playManager.createPlayToken(playId, activePermission);
					failureAMFlow.authenticate(playToken, (err, _permission) => {
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
				return new Promise<void>((resolve, reject) => {
					// Play を suspend した後でも TickList を取得できる
					passiveAMFlow.getTickList({ begin: 0, end: 10 }, (err, tickList) => {
						if (err) {
							reject(err);
							return;
						}
						expect(tickList).toEqual([
							0,
							6,
							[
								[1, [[1, 0b00010, "dummy-1-2"]]],
								[3, []],
								[
									5,
									[
										[0, 0b10000, "dummy-3-1"],
										[1, 0b10010, "dummy-3-2"],
										[2, 0b00111, "dummy-3-3"]
									]
								],
								[6, [[0, 0b00000, "dummy-4-1"]]]
							]
						]);
						resolve();
					});
				});
			})
			.then(() => {
				return new Promise<void>((resolve, reject) => {
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
						(e) => {
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
				return new Promise<void>((resolve, reject) => {
					let startPoint: StartPoint;
					activeAMFlow.onPutStartPoint.add((s) => {
						startPoint = s;
					});

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
						(e) => {
							if (e) {
								reject(e);
								return;
							}
							expect(startPoint).toEqual({
								frame: 10,
								timestamp: 1000,
								data: "hoge"
							});
							resolve();
						}
					);
				});
			})
			.then(() => {
				return new Promise<void>((resolve, reject) => {
					// Play を resume した後に TickList を取得できる
					passiveAMFlow.getTickList({ begin: 0, end: 10 }, (err, tickList) => {
						if (err) {
							reject(err);
							return;
						}
						expect(tickList).toEqual([
							0,
							6,
							[
								[1, [[1, 0b00010, "dummy-1-2"]]],
								[3, []],
								[
									5,
									[
										[0, 0b10000, "dummy-3-1"],
										[1, 0b10010, "dummy-3-2"],
										[2, 0b00111, "dummy-3-3"]
									]
								],
								[6, [[0, 0b00000, "dummy-4-1"]]]
							]
						]);
						resolve();
					});
				});
			})
			.then(() => {
				return new Promise<void>((resolve, reject) => {
					// resume 後に write, send 権限を含む permission が認証できる
					const playToken = playManager.createPlayToken(playId, activePermission);
					failureAMFlow.authenticate(playToken, (err, _permission) => {
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
				return new Promise<void>((resolve, reject) => {
					// すでに delete したプレーの AMFlowClient に対して close() を呼び出しても問題ない
					passiveAMFlow.close((err) => (err ? reject(err) : resolve()));
				});
			})
			.then(done)
			.catch((e) => done(e));
	});

	it("AMFlow#onEvent が登録されるより以前の Event を正しく取得できる", (done) => {
		const playManager = new PlayManager();
		let activeAMFlow: AMFlowClient;
		let passiveAMFlow: AMFlowClient;
		let playId: string;
		const events: Event[] = [];
		playManager
			.createPlay({
				contentUrl: "dummy"
			})
			.then((p) => {
				return new Promise<void>((resolve, reject) => {
					playId = p;
					activeAMFlow = playManager.createAMFlow(playId);
					activeAMFlow.open(playId, (err) => {
						if (err) {
							reject(err);
							return;
						}
						resolve();
					});
				});
			})
			.then(() => {
				return new Promise<void>((resolve, reject) => {
					passiveAMFlow = playManager.createAMFlow(playId);
					passiveAMFlow.open(playId, (err) => {
						if (err) {
							reject(err);
							return;
						}
						resolve();
					});
				});
			})
			.then(() => {
				return new Promise<void>((resolve, reject) => {
					// 認証できる
					const playToken = playManager.createPlayToken(playId, passivePermission);
					passiveAMFlow.authenticate(playToken, (err) => {
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
				return new Promise<void>((resolve, reject) => {
					// Active の認証
					const playToken = playManager.createPlayToken(playId, activePermission);
					activeAMFlow.authenticate(playToken, (err) => {
						if (err) {
							reject(err);
							return;
						}
						resolve();
					});
				});
			})
			.then(() => {
				activeAMFlow.onEvent((event) => {
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
			.catch((e) => done(e));
	});

	it("プレイログを渡してプレイを生成できる", (done) => {
		const playManager = new PlayManager();
		let amflow: AMFlowClient;
		let playId: string;

		const sp0 = {
			frame: 0,
			timestamp: 0,
			data: {
				seed: 1628673373839,
				fps: 30,
				startedAt: 1628673373839
			}
		};
		const sp100 = {
			frame: 100,
			timestamp: 10000,
			data: {
				randGenSer: {
					_seed: 1628673373839,
					_xorshift: {
						_state0U: 1903457992,
						_state0L: 157751404,
						_state1U: -106591148,
						_state1L: -981538619
					}
				},
				nextEntityId: 10,
				gameSnapshot: {
					value: 42
				}
			}
		};
		const playlog: DumpedPlaylog = {
			tickList: [0, 200, [[77, [[33, 2, "pid1", 1, 174, 243, null]]]]],
			startPoints: [sp0, sp100]
		};

		playManager
			.createPlay({ contentUrl: "dummy" }, playlog)
			.then((p) => {
				return new Promise<void>((resolve, reject) => {
					playId = p;
					amflow = playManager.createAMFlow(playId);
					amflow.open(playId, (err) => {
						if (err) {
							reject(err);
							return;
						}
						resolve();
					});
				});
			})
			.then(() => {
				return new Promise<void>((resolve, reject) => {
					// 認証できる
					const playToken = playManager.createPlayToken(playId, passivePermission);
					amflow.authenticate(playToken, (err) => {
						if (err) {
							reject(err);
							return;
						}
						resolve();
					});
				});
			})
			.then(() => {
				return new Promise<TickList>((res, rej) => {
					amflow.getTickList({ begin: 70, end: 150 }, (err, ticks) => (err ? rej(err) : res(ticks!)));
				});
			})
			.then((tickList) => {
				expect(tickList).toEqual([70, 149, [[77, [[33, 2, "pid1", 1, 174, 243, null]]]]]);
			})
			.then(() => {
				return new Promise<StartPoint>((res, rej) => {
					amflow.getStartPoint({ frame: 20 }, (err, sp) => (err ? rej(err) : res(sp!)));
				});
			})
			.then((sp) => {
				expect(sp).toEqual(sp0);
			})
			.then(() => {
				return new Promise<StartPoint>((res, rej) => {
					amflow.getStartPoint({ frame: 110 }, (err, sp) => (err ? rej(err) : res(sp!)));
				});
			})
			.then((sp) => {
				expect(sp).toEqual(sp100);
			})
			.then(() => {
				return new Promise<StartPoint>((res, rej) => {
					amflow.getStartPoint({ timestamp: 10001 }, (err, sp) => (err ? rej(err) : res(sp!)));
				});
			})
			.then((sp) => {
				expect(sp).toEqual(sp100);
			})
			.then(done)
			.catch((e) => done(e));
	});
});
