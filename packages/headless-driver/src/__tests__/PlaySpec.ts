import * as path from "path";
import * as ExecuteVmScriptV1 from "../ExecuteVmScriptV1";
import * as ExecuteVmScriptV2 from "../ExecuteVmScriptV2";
import { setSystemLogger } from "../Logger";
import { AMFlowStore } from "../play/amflow/AMFlowStore";
import { AMFlowClientManager } from "../play/AMFlowClientManager";
import { PlayManager } from "../play/PlayManager";
import { activePermission } from "./constants";
import { MockRunnerManager } from "./helpers/MockRunnerManager";
import { SilentLogger } from "./helpers/SilentLogger";

setSystemLogger(new SilentLogger());

const contentUrl = process.env.CONTENT_URL_V2;

beforeAll(() => {
	jest.spyOn(ExecuteVmScriptV1, "getFilePath").mockReturnValue(path.resolve(__dirname, "../../lib/", "ExecuteVmScriptV1.js"));
	jest.spyOn(ExecuteVmScriptV2, "getFilePath").mockReturnValue(path.resolve(__dirname, "../../lib/", "ExecuteVmScriptV2.js"));
});

describe("プレー周りのテスト", () => {
	it("各インスタンスを生成できる", async () => {
		const playManager = new PlayManager();
		const playId0 = await playManager.createPlay({
			contentUrl: contentUrl!
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
		const runner0 = runnerManager.getRunner(runnerId0);

		expect(runner0!.runnerId).toBe("0");
		expect(runner0!.engineVersion).toBe("2");

		const playId1 = await playManager.createPlay({
			contentUrl: contentUrl!
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
		const runner1 = runnerManager.getRunner(runnerId1);

		expect(runner1!.runnerId).toBe("1");
		expect(runner0!.engineVersion).toBe("2");

		await runnerManager.startRunner("0");
		await runnerManager.stopRunner("0");
		expect(runnerManager.getRunner("0")).toBe(null);

		playManager.deletePlay("0");
		expect(playManager.getPlay("0")).toBe(null);

		const playId2 = await playManager.createPlay({
			contentUrl: contentUrl!
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
		const runner2 = runnerManager.getRunner(runnerId2);
		expect(runner2!.runnerId).toBe("2");
		expect(runner2!.engineVersion).toBe("2");
	});

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

	it("Play の管理ができる", async () => {
		const playManager = new PlayManager();
		const playId1 = await playManager.createPlay({ contentUrl: contentUrl! });
		const playId2 = await playManager.createPlay({ contentUrl: contentUrl! });
		const playId3 = await playManager.createPlay({ contentUrl: contentUrl! });

		let playIds = playManager.getAllPlays().map((play) => play.playId);
		expect(playIds).toEqual([playId1, playId2, playId3]);

		playManager.suspendPlay(playId1);

		// すべてのPlay
		playIds = playManager.getAllPlays().map((play) => play.playId);
		expect(playIds).toEqual([playId1, playId2, playId3]);
		// running の Play
		playIds = playManager.getPlays({ status: "running" }).map((play) => play.playId);
		expect(playIds).toEqual([playId2, playId3]);
		// suspend の Play
		playIds = playManager.getPlays({ status: "suspending" }).map((play) => play.playId);
		expect(playIds).toEqual([playId1]);

		playManager.deletePlay(playId2);

		// すべてのPlay
		playIds = playManager.getAllPlays().map((play) => play.playId);
		expect(playIds).toEqual([playId1, playId3]);
		// running の Play
		playIds = playManager.getPlays({ status: "running" }).map((play) => play.playId);
		expect(playIds).toEqual([playId3]);
		// suspend の Play
		playIds = playManager.getPlays({ status: "suspending" }).map((play) => play.playId);
		expect(playIds).toEqual([playId1]);

		playManager.resumePlay(playId1);

		// すべてのPlay
		playIds = playManager.getAllPlays().map((play) => play.playId);
		expect(playIds).toEqual([playId1, playId3]);
		// running の Play
		playIds = playManager.getPlays({ status: "running" }).map((play) => play.playId);
		expect(playIds).toEqual([playId1, playId3]);
		// suspend の Play
		playIds = playManager.getPlays({ status: "suspending" }).map((play) => play.playId);
		expect(playIds).toEqual([]);
	});
});
