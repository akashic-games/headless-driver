import { GetStartPointOptions, StartPoint, GetTickListOptions } from "@akashic/amflow";
import { Event, TickList } from "@akashic/playlog";
import { setSystemLogger } from "../Logger";
import { AMFlowClient } from "../play/amflow/AMFlowClient";
import { BadRequestError, PermissionError } from "../play/amflow/ErrorFactory";
import { AMFlowClientManager } from "../play/AMFlowClientManager";
import { PlayManager } from "../play/PlayManager";
import { activePermission, passivePermission } from "./constants";
import { SilentLogger } from "./helpers/SilentLogger";

setSystemLogger(new SilentLogger());

describe("AMFlow の動作テスト", () => {
	it("getStartPoint で正しく startPoint が取得できる", (done) => {
		const amflowClientManager = new AMFlowClientManager();
		const amflowClient = amflowClientManager.createAMFlow("0");
		amflowClient.open("0", () => {
			const token = amflowClientManager.createPlayToken("0", activePermission);
			amflowClient.authenticate(token, async () => {
				const getStartPoint: (opts: GetStartPointOptions) => Promise<StartPoint> = (opts) =>
					new Promise<StartPoint>((resolve, reject) => {
						amflowClient.getStartPoint(opts, (e, data) => (e ? reject(e) : resolve(data)));
					});
				const putStartPoint: (sp: StartPoint) => Promise<StartPoint> = (sp) =>
					new Promise((resolve, reject) => {
						amflowClient.putStartPoint(sp, (e) => (e ? reject(e) : resolve()));
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
				return new Promise((resolve, reject) => {
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
				return new Promise((resolve, reject) => {
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
				return new Promise((resolve, reject) => {
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
				return new Promise((resolve, reject) => {
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

	it("AMFlow通信ができる", (done) => {
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
				return new Promise((resolve, reject) => {
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
				return new Promise((resolve, reject) => {
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
				return new Promise((resolve, reject) => {
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
				activeAMFlow.sendTick([6, [[0, 0b0000, "dummy-4-1"]]]);

				const getTickListLegacy = (begin: number, end: number) =>
					new Promise<TickList>((res, rej) => {
						// NOTE: 非推奨の引数による動作確認
						passiveAMFlow.getTickList(begin, end, (err, ticks) => (err ? rej(err) : res(ticks)));
					});

				const getTickList = (opts: GetTickListOptions) =>
					new Promise<TickList>((res, rej) => {
						passiveAMFlow.getTickList(opts, (err, ticks) => (err ? rej(err) : res(ticks)));
					});

				// 非推奨の引数でも TickList を取得できることを確認
				expect(await getTickListLegacy(0, 5)).toEqual([
					0,
					5,
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
						]
					]
				]);

				// すべての TickList を取得できる
				const unfilteredTickList = await getTickList({ begin: 0, end: 5 });

				expect(unfilteredTickList).toEqual([
					0,
					5,
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
						]
					]
				]);

				// すべての TickList を取得できる
				expect(
					await getTickList({
						begin: 0,
						end: 5,
						excludeEventFlags: {}
					}
				)).toEqual(unfilteredTickList);

				// すべての TickList を取得できる
				expect(
					await getTickList({
						begin: 0,
						end: 5,
						excludeEventFlags: {
							ignorable: false
						}
					}
				)).toEqual(unfilteredTickList);

				// Ignorable Event を除外した TickList を取得できる
				expect(
					await getTickList({
						begin: 0,
						end: 5,
						excludeEventFlags: {
							ignorable: true
						}
					})
				).toEqual([
					0,
					5,
					[
						[1, [[1, 0b00010, "dummy-1-2"]]],
						[3, []],
						[5, [[2, 0b00111, "dummy-3-3"]]]
					]
				]);
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
					passiveAMFlow.sendEvent([0, 0b011, "dummy-player-id"]);
				});
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					// Event の受信ハンドラを登録できる
					const eventHandler = (event: number[]) => {
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
					passiveAMFlow.getTickList(0, 10, (err, tickList) => {
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
						(e) => {
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
					passiveAMFlow.getTickList(0, 10, (err, tickList) => {
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
					passiveAMFlow.close((err) => (err ? reject(err) : resolve()));
				});
			})
			.then(done)
			.catch((e) => done(e));
	});
});
