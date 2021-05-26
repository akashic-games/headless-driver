import { GetStartPointOptions, StartPoint } from "@akashic/amflow";
import { activePermission } from "../../__tests__/constants";
import { SilentLogger } from "../../__tests__/helpers/SilentLogger";
import { setSystemLogger } from "../../Logger";
import { AMFlowStore } from "../amflow/AMFlowStore";
import { AMFlowClientManager } from "../AMFlowClientManager";

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
});
