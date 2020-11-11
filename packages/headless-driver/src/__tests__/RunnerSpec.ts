import { RunnerV1 } from "@akashic/headless-driver-runner-v1";
import { RunnerV2 } from "@akashic/headless-driver-runner-v2";
import { RunnerV3 } from "@akashic/headless-driver-runner-v3";
import * as path from "path";
import * as ExecuteVmScriptV1 from "../ExecuteVmScriptV1";
import * as ExecuteVmScriptV2 from "../ExecuteVmScriptV2";
import * as ExecuteVmScriptV3 from "../ExecuteVmScriptV3";
import { setSystemLogger } from "../Logger";
import { PlayManager } from "../play/PlayManager";
import { RunnerManager } from "../runner/RunnerManager";
import { activePermission } from "./constants";
import { SilentLogger } from "./helpers/SilentLogger";

const gameJsonUrlV1 = process.env.GAME_JSON_URL_V1;
const gameJsonUrlV2 = process.env.GAME_JSON_URL_V2;
const gameJsonUrlV3 = process.env.GAME_JSON_URL_V3;

setSystemLogger(new SilentLogger());

beforeAll(() => {
	jest.spyOn(ExecuteVmScriptV1, "getFilePath").mockReturnValue(path.resolve(__dirname, "../../lib/", "ExecuteVmScriptV1.js"));
	jest.spyOn(ExecuteVmScriptV2, "getFilePath").mockReturnValue(path.resolve(__dirname, "../../lib/", "ExecuteVmScriptV2.js"));
	jest.spyOn(ExecuteVmScriptV3, "getFilePath").mockReturnValue(path.resolve(__dirname, "../../lib/", "ExecuteVmScriptV3.js"));
});

function sleep(duration: number): Promise<void> {
	return new Promise((resolve, _reject) => {
		setTimeout(resolve, duration);
	});
}

async function readyRunner(gameJsonPath: string) {
	const playManager = new PlayManager();
	const playId = await playManager.createPlay({
		gameJsonPath
	});
	const activeAMFlow = playManager.createAMFlow(playId);
	const playToken = playManager.createPlayToken(playId, activePermission);
	const runnerManager = new RunnerManager(playManager);
	const runnerId = await runnerManager.createRunner({
		playId,
		amflow: activeAMFlow,
		playToken,
		executionMode: "active",
		allowedUrls: null,
		externalValue: {
			isSendSkipChanged: true,
			isSendSceneUpdateCalled: true
		}
	});
	const runner = runnerManager.getRunner(runnerId);
	return runner;
}

describe("Runner の動作確認 (v1)", () => {
	it("Runner#pause() / resume() でコンテンツが一時停止・再開できる", async () => {
		const runner = (await readyRunner(gameJsonUrlV1)) as RunnerV1;

		const updateLogs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") updateLogs.push(l);
		});

		await runner.start();
		runner.pause();

		await sleep(500);
		expect(updateLogs.length).toBe(0);

		runner.resume();

		await sleep(500);
		runner.pause();
		const logCount = updateLogs.length;
		expect(logCount).toBeGreaterThan(10); // 500ms + 30fps で必ず進むであろうフレーム数

		await sleep(100);
		expect(updateLogs.length).toBeGreaterThanOrEqual(logCount); // 停止したままであることを確認

		runner.stop();
	});

	it("Runner#step() で 1 ティックごとにコンテンツが進行できる", async () => {
		const runner = (await readyRunner(gameJsonUrlV1)) as RunnerV1;

		await runner.start();
		runner.pause();

		const logs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") logs.push(l);
		});

		// step() を呼び出すたびに g.Scene#onUpdate が発火することを確認
		await runner.step();
		expect(logs).toEqual(["scene_update"]);
		await runner.step();
		expect(logs).toEqual(["scene_update", "scene_update"]);
		await runner.step();
		expect(logs).toEqual(["scene_update", "scene_update", "scene_update"]);

		runner.stop();
	});

	it("Runner#advance() でコンテンツが進行できる (1000 ms)", async () => {
		const runner = (await readyRunner(gameJsonUrlV1)) as RunnerV1;

		await runner.start();
		runner.pause();

		const updateLogs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") updateLogs.push(l);
		});

		// NOTE: v1 には g.Game#skippingChanged が存在しないため skip に関するテストを割愛
		await runner.advance(1000); // 1秒 (30フレーム) だけ進行
		expect(updateLogs.length).toBe(30);

		runner.stop();
	});

	it("Runner#advance() でコンテンツが進行できる (18000 ms)", async () => {
		const runner = (await readyRunner(gameJsonUrlV1)) as RunnerV1;

		await runner.start();
		runner.pause();

		const updateLogs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") updateLogs.push(l);
		});

		// NOTE: v1 には g.Game#skippingChanged が存在しないため skip に関するテストを割愛
		await runner.advance(1000 * 60); // 60秒 (60 * 30フレーム) だけ進行
		expect(updateLogs.length).toBe(60 * 30);

		runner.stop();
	});
});

describe("Runner の動作確認 (v2)", () => {
	it("Runner#pause() / resume() でコンテンツが一時停止・再開できる", async () => {
		const runner = (await readyRunner(gameJsonUrlV2)) as RunnerV2;

		const updateLogs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") updateLogs.push(l);
		});

		await runner.start();
		runner.pause();

		await sleep(500);
		expect(updateLogs.length).toBe(0);

		runner.resume();

		await sleep(500);
		runner.pause();
		const logCount = updateLogs.length;
		expect(logCount).toBeGreaterThan(10); // 500ms + 30fps で必ず進むであろうフレーム数

		await sleep(100);
		expect(updateLogs.length).toBeGreaterThanOrEqual(logCount); // 停止したままであることを確認

		runner.stop();
	});

	it("Runner#step() で 1 ティックごとにコンテンツが進行できる", async () => {
		const runner = (await readyRunner(gameJsonUrlV2)) as RunnerV2;

		await runner.start();
		runner.pause();

		const logs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") logs.push(l);
		});

		// step() を呼び出すたびに g.Scene#onUpdate が発火することを確認
		await runner.step();
		expect(logs).toEqual(["scene_update"]);
		await runner.step();
		expect(logs).toEqual(["scene_update", "scene_update"]);
		await runner.step();
		expect(logs).toEqual(["scene_update", "scene_update", "scene_update"]);

		runner.stop();
	});

	it("Runner#advance() でコンテンツが進行できる (1000 ms)", async () => {
		const runner = (await readyRunner(gameJsonUrlV2)) as RunnerV2;

		await runner.start();
		runner.pause();

		const updateLogs: string[] = [];
		const skippingLogs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") updateLogs.push(l);
		});
		runner.sendToExternalTrigger.add((l) => {
			if (l === "start_skipping" || l === "end_skipping") skippingLogs.push(l);
		});

		await runner.advance(1000); // 1秒 (30フレーム) だけ進行
		expect(updateLogs.length).toBe(30);
		expect(skippingLogs).toEqual(["start_skipping", "end_skipping"]);

		runner.stop();
	});

	it("Runner#advance() でコンテンツが進行できる (18000 ms)", async () => {
		const runner = (await readyRunner(gameJsonUrlV2)) as RunnerV2;

		await runner.start();
		runner.pause();

		const updateLogs: string[] = [];
		const skippingLogs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") updateLogs.push(l);
		});
		runner.sendToExternalTrigger.add((l) => {
			if (l === "start_skipping" || l === "end_skipping") skippingLogs.push(l);
		});

		await runner.advance(1000 * 60); // 60秒 (60 * 30フレーム) だけ進行
		expect(updateLogs.length).toBe(60 * 30);
		expect(skippingLogs).toEqual(["start_skipping", "end_skipping"]); // start と end のペアが一度だけなのを確認

		runner.stop();
	});
});

describe("Runner の動作確認 (v3)", () => {
	it("Runner#pause() / resume() でコンテンツが一時停止・再開できる", async () => {
		const runner = (await readyRunner(gameJsonUrlV3)) as RunnerV3;

		const updateLogs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") updateLogs.push(l);
		});

		await runner.start();
		runner.pause();

		await sleep(500);
		expect(updateLogs.length).toBe(0);

		runner.resume();

		await sleep(500);
		runner.pause();
		const logCount = updateLogs.length;
		expect(logCount).toBeGreaterThan(10); // 500ms + 30fps で必ず進むであろうフレーム数

		await sleep(100);
		expect(updateLogs.length).toBeGreaterThanOrEqual(logCount); // 停止したままであることを確認

		runner.stop();
	});

	it("Runner#step() で 1 ティックごとにコンテンツが進行できる", async () => {
		const runner = (await readyRunner(gameJsonUrlV3)) as RunnerV3;

		await runner.start();
		runner.pause();

		const logs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") logs.push(l);
		});

		// step() を呼び出すたびに g.Scene#onUpdate が発火することを確認
		runner.step();
		expect(logs).toEqual(["scene_update"]);
		runner.step();
		expect(logs).toEqual(["scene_update", "scene_update"]);
		runner.step();
		expect(logs).toEqual(["scene_update", "scene_update", "scene_update"]);

		runner.stop();
	});

	it("Runner#advance() でコンテンツが進行できる (1000 ms)", async () => {
		const runner = (await readyRunner(gameJsonUrlV3)) as RunnerV3;

		await runner.start();
		runner.pause();

		const updateLogs: string[] = [];
		const skippingLogs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") updateLogs.push(l);
		});
		runner.sendToExternalTrigger.add((l) => {
			if (l === "start_skipping" || l === "end_skipping") skippingLogs.push(l);
		});

		await runner.advance(1000); // 1秒 (30フレーム) だけ進行
		expect(updateLogs.length).toBe(30);
		expect(skippingLogs).toEqual(["start_skipping", "end_skipping"]);

		runner.stop();
	});

	it("Runner#advance() でコンテンツが進行できる (18000 ms)", async () => {
		const runner = (await readyRunner(gameJsonUrlV3)) as RunnerV3;

		await runner.start();
		runner.pause();

		const updateLogs: string[] = [];
		const skippingLogs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") updateLogs.push(l);
		});
		runner.sendToExternalTrigger.add((l) => {
			if (l === "start_skipping" || l === "end_skipping") skippingLogs.push(l);
		});

		await runner.advance(1000 * 60); // 60秒 (60 * 30フレーム) だけ進行
		expect(updateLogs.length).toBe(60 * 30);
		expect(skippingLogs).toEqual(["start_skipping", "end_skipping"]); // start と end のペアが一度だけなのを確認

		runner.stop();
	});
});
