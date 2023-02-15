import type { GetStartPointOptions, GetTickListOptions, StartPoint } from "@akashic/amflow";
import type { MessageEvent, TickList } from "@akashic/playlog";
import { EventCode } from "@akashic/playlog";
import { setSystemLogger } from "../Logger";
import type { AMFlowStore } from "../play/amflow/AMFlowStore";
import { AMFlowClientManager } from "../play/AMFlowClientManager";
import { activePermission } from "./constants";
import { SilentLogger } from "./helpers/SilentLogger";

setSystemLogger(new SilentLogger());

describe("AMFlowClientManager の単体テスト", () => {
	it("AMFlow, playTokenの管理ができる", () => {
		const amflowClientManager = new AMFlowClientManager();

		const token1 = amflowClientManager.createPlayToken("0", activePermission);
		const authenticated1 = amflowClientManager.authenticatePlayToken("0", token1);
		expect(authenticated1).toEqual(activePermission);

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
		expect(storeMap.get("0")).toBeUndefined();
	});

	it("getStartPoint で正しく startPoint が取得できる", (done) => {
		const amflowClientManager = new AMFlowClientManager();
		const amflowClient = amflowClientManager.createAMFlow("0");
		amflowClient.open("0", () => {
			const token = amflowClientManager.createPlayToken("0", activePermission);
			amflowClient.authenticate(token, async () => {
				const getStartPoint: (opts: GetStartPointOptions) => Promise<StartPoint> = (opts) =>
					new Promise<StartPoint>((resolve, reject) => {
						amflowClient.getStartPoint(opts, (e, data) => (e ? reject(e) : resolve(data!)));
					});
				const putStartPoint: (sp: StartPoint) => Promise<void> = (sp) =>
					new Promise<void>((resolve, reject) => {
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

				// no startPoint for the given time
				// 仕様未検討: frame での指定同様第 0 スタートポイントの書き込みを待ってそれを返すべき？
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

	it("getStartPoint は startPoint の書き込みを待つ", (done) => {
		const amflowClientManager = new AMFlowClientManager();
		const amflowClient = amflowClientManager.createAMFlow("0");
		amflowClient.open("0", () => {
			const token = amflowClientManager.createPlayToken("0", activePermission);
			amflowClient.authenticate(token, async () => {
				const getStartPoint: (opts: GetStartPointOptions) => Promise<StartPoint> = (opts) =>
					new Promise<StartPoint>((resolve, reject) => {
						amflowClient.getStartPoint(opts, (e, data) => (e ? reject(e) : resolve(data!)));
					});
				const putStartPoint: (sp: StartPoint) => Promise<void> = (sp) =>
					new Promise<void>((resolve, reject) => {
						amflowClient.putStartPoint(sp, (e) => (e ? reject(e) : resolve()));
					});

				getStartPoint({ frame: 0 }).then((sp) => {
					expect(sp.data).toBe("frame0");
					done();
				});

				// getStartPoint() が非同期で待機することの確認のため意図的に遅延
				await new Promise((resolve) => setTimeout(resolve, 100));

				await putStartPoint({
					frame: 0,
					timestamp: 100,
					data: "frame0"
				});
			});
		});
	});

	it("getTickList で正しく tickList が得られる", (done) => {
		const amflowClientManager = new AMFlowClientManager();
		const amflowClient = amflowClientManager.createAMFlow("0");
		amflowClient.open("0", () => {
			const token = amflowClientManager.createPlayToken("0", activePermission);
			amflowClient.authenticate(token, async () => {
				const getTickList: (opts: GetTickListOptions) => Promise<TickList | undefined> = (opts) =>
					new Promise<TickList | undefined>((resolve, reject) => {
						amflowClient.getTickList(opts, (e, data) => (e ? reject(e) : resolve(data!)));
					});

				// when nothing
				const tl1 = await getTickList({ begin: 0, end: 10 });
				expect(tl1).toBe(undefined);

				// out of range
				amflowClient.sendTick([0]);
				const tl2 = await getTickList({ begin: 100, end: 120 });
				expect(tl2).toBe(undefined);

				// typical
				const msg: MessageEvent = [EventCode.Message, 0, "dummy", {}];
				amflowClient.sendTick([1, [msg]]);
				const tl4 = await getTickList({ begin: 0, end: 10 });
				expect(tl4).toEqual([0, 1, [[1, [msg]]]]);

				done();
			});
		});
	});
});
