import * as fs from "fs";
import * as path from "path";
import { RunnerV1 } from "@akashic/headless-driver-runner-v1";
import { RunnerV2 } from "@akashic/headless-driver-runner-v2";
import { RunnerV3 } from "@akashic/headless-driver-runner-v3";
import * as ExecuteVmScriptV1 from "../ExecuteVmScriptV1";
import * as ExecuteVmScriptV2 from "../ExecuteVmScriptV2";
import * as ExecuteVmScriptV3 from "../ExecuteVmScriptV3";
import { setSystemLogger } from "../Logger";
import { PlayManager } from "../play/PlayManager";
import { RunnerManager } from "../runner/RunnerManager";
import { activePermission } from "./constants";
import { SilentLogger } from "./helpers/SilentLogger";

const gameJsonUrlV1 = process.env.GAME_JSON_URL_V1!;
const gameJsonUrlV2 = process.env.GAME_JSON_URL_V2!;
const gameJsonUrlV3 = process.env.GAME_JSON_URL_V3!;

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

async function readyRunner(gameJsonPath: string): Promise<(RunnerV1 | RunnerV2 | RunnerV3) | null> {
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
			isSendingSceneUpdateCalled: true
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
		let logCount = updateLogs.length;
		runner.pause();

		await sleep(500);
		expect(updateLogs.length).toBe(logCount);

		await runner.advance(500);
		runner.pause();
		logCount = updateLogs.length;
		expect(logCount).toBeGreaterThan(10); // 500ms + 30fps で必ず進むであろうフレーム数

		await runner.advance(100);
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

	it("Runner#advance() でコンテンツが進行できる (60 s)", async () => {
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
		let logCount = updateLogs.length;
		runner.pause();

		await sleep(500);
		expect(updateLogs.length).toBe(logCount);

		await runner.advance(500);
		runner.pause();
		logCount = updateLogs.length;
		expect(logCount).toBeGreaterThan(10); // 500ms + 30fps で必ず進むであろうフレーム数

		await runner.advance(100);
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
		const skippingLogs: string[] = [];
		const runner = (await readyRunner(gameJsonUrlV2)) as RunnerV2;
		runner.sendToExternalTrigger.add((l) => {
			if (l === "start_skipping" || l === "end_skipping") skippingLogs.push(l);
		});

		await runner.start();
		runner.pause();

		const updateLogs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") updateLogs.push(l);
		});

		await runner.advance(1000); // 1秒 (30フレーム) だけ進行
		expect(updateLogs.length).toBe(30);
		expect(skippingLogs).toEqual(["start_skipping", "end_skipping"]);

		runner.stop();
	});

	it("Runner#advance() でコンテンツが進行できる (60 s)", async () => {
		const skippingLogs: string[] = [];
		const runner = (await readyRunner(gameJsonUrlV2)) as RunnerV2;
		runner.sendToExternalTrigger.add((l) => {
			if (l === "start_skipping" || l === "end_skipping") skippingLogs.push(l);
		});

		await runner.start();
		runner.pause();

		const updateLogs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") updateLogs.push(l);
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
		let logCount = updateLogs.length;
		runner.pause();

		await sleep(500);
		expect(updateLogs.length).toBe(logCount);

		await runner.advance(500);
		runner.pause();
		logCount = updateLogs.length;
		expect(logCount).toBeGreaterThan(10); // 500ms + 30fps で必ず進むであろうフレーム数

		await runner.advance(100);
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
		const skippingLogs: string[] = [];
		const runner = (await readyRunner(gameJsonUrlV3)) as RunnerV3;
		runner.sendToExternalTrigger.add((l) => {
			if (l === "start_skipping" || l === "end_skipping") skippingLogs.push(l);
		});

		await runner.start();
		runner.pause();

		const updateLogs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") updateLogs.push(l);
		});

		await runner.advance(1000); // 1秒 (30フレーム) だけ進行
		expect(updateLogs.length).toBe(30);
		expect(skippingLogs).toEqual(["start_skipping", "end_skipping"]);

		runner.stop();
	});

	it("Runner#advance() でコンテンツが進行できる (60 s)", async () => {
		const skippingLogs: string[] = [];
		const runner = (await readyRunner(gameJsonUrlV3)) as RunnerV3;
		runner.sendToExternalTrigger.add((l) => {
			if (l === "start_skipping" || l === "end_skipping") skippingLogs.push(l);
		});

		await runner.start();
		runner.pause();

		const updateLogs: string[] = [];

		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") updateLogs.push(l);
		});

		await runner.advance(1000 * 60); // 60秒 (60 * 30フレーム) だけ進行
		expect(updateLogs.length).toBe(60 * 30);
		expect(skippingLogs).toEqual(["start_skipping", "end_skipping"]); // start と end のペアが一度だけなのを確認

		runner.stop();
	});
});

describe("Runner の engine-files 上書き動作確認", () => {
	beforeEach(() => {
		jest.resetModules();
	});

	afterEach(() => {
		delete process.env.ENGINE_FILES_V3_PATH;
	});

	it("環境変数を利用して debug 用の engineFiles を上書きできる", async () => {
		const engineFilesFromPath = path.join(__dirname, "fixtures", "engineFilesV3", "engineFilesV3_0_15.debug.js");
		const engineFilesToPath = path.join(__dirname, "tmp", "engineFilesV3_0_15.debug.js");
		const engineFilesStr = fs.readFileSync(engineFilesFromPath);

		// 読み込まれていることを確認するためテストコードを仕込んでおく
		const randStr = Date.now() + "";
		fs.writeFileSync(engineFilesToPath, `globalThis.__test_${randStr}__ = true; \n\n` + engineFilesStr);

		process.env.ENGINE_FILES_V3_PATH = engineFilesToPath;

		const runner = (await readyRunner(gameJsonUrlV3)) as RunnerV3;

		await runner.start();
		runner.pause();

		const logs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") logs.push(l);
		});

		runner.step();
		runner.step();
		runner.step();
		expect(logs).toEqual(["scene_update", "scene_update", "scene_update"]);
		expect((globalThis as any)[`__test_${randStr}__`]).toBe(true);

		runner.stop();
	});

	it("環境変数を利用して release 用の engineFiles を上書きできる", async () => {
		const engineFilesFromPath = path.join(__dirname, "fixtures", "engineFilesV3", "engineFilesV3_0_15.release.js");
		const engineFilesToPath = path.join(__dirname, "tmp", "engineFilesV3_0_15.release.js");
		const engineFilesStr = fs.readFileSync(engineFilesFromPath);

		// 読み込まれていることを確認するためテストコードを仕込んでおく
		const randStr = Date.now() + "";
		fs.writeFileSync(engineFilesToPath, `globalThis.__test_${randStr}__ = true; \n\n` + engineFilesStr);

		process.env.ENGINE_FILES_V3_PATH = engineFilesToPath;

		const runner = (await readyRunner(gameJsonUrlV3)) as RunnerV3;

		await runner.start();
		runner.pause();

		const logs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") logs.push(l);
		});

		runner.step();
		runner.step();
		runner.step();
		expect(logs).toEqual(["scene_update", "scene_update", "scene_update"]);
		expect((globalThis as any)[`__test_${randStr}__`]).toBe(true);

		runner.stop();
	});
});

describe("Runner の動作確認 (異常系)", () => {
	it("(v1) Runner#pause() せずに Runner#advance() を呼ぶことはできない", async () => {
		const runner = (await readyRunner(gameJsonUrlV1)) as RunnerV1;
		await runner.start();
		await sleep(500);
		let err: any;
		runner.errorTrigger.add((e) => {
			err = e;
		});
		await runner.advance(1000);
		// trigger 経由でエラーが通知されることを確認
		expect(err).not.toBeUndefined();
		runner.stop();
	});

	it("(v1) Runner#pause() せずに Runner#step() を呼ぶことはできない", async () => {
		const runner = (await readyRunner(gameJsonUrlV1)) as RunnerV1;
		await runner.start();
		await sleep(500);
		let err: any;
		runner.errorTrigger.add((e) => {
			err = e;
		});
		runner.step();
		// trigger 経由でエラーが通知されることを確認
		expect(err).not.toBeUndefined();
		runner.stop();
	});

	it("(v2) Runner#pause() せずに Runner#advance() を呼ぶことはできない", async () => {
		const runner = (await readyRunner(gameJsonUrlV2)) as RunnerV2;
		await runner.start();
		await sleep(500);
		let err: any;
		runner.errorTrigger.add((e) => {
			err = e;
		});
		await runner.advance(1000);
		// trigger 経由でエラーが通知されることを確認
		expect(err).not.toBeUndefined();
		runner.stop();
	});

	it("(v2) Runner#pause() せずに Runner#step() を呼ぶことはできない", async () => {
		const runner = (await readyRunner(gameJsonUrlV2)) as RunnerV2;
		await runner.start();
		await sleep(500);
		let err: any;
		runner.errorTrigger.add((e) => {
			err = e;
		});
		runner.step();
		// trigger 経由でエラーが通知されることを確認
		expect(err).not.toBeUndefined();
		runner.stop();
	});

	it("(v3) Runner#pause() せずに Runner#advance() を呼ぶことはできない", async () => {
		const runner = (await readyRunner(gameJsonUrlV3)) as RunnerV3;
		await runner.start();
		await sleep(500);
		let err: any;
		runner.errorTrigger.add((e) => {
			err = e;
		});
		await runner.advance(1000);
		// trigger 経由でエラーが通知されることを確認
		expect(err).not.toBeUndefined();
		runner.stop();
	});

	it("(v3) Runner#pause() せずに Runner#step() を呼ぶことはできない", async () => {
		const runner = (await readyRunner(gameJsonUrlV3)) as RunnerV3;
		await runner.start();
		await sleep(500);
		let err: any;
		runner.errorTrigger.add((e) => {
			err = e;
		});
		runner.step();
		// trigger 経由でエラーが通知されることを確認
		expect(err).not.toBeUndefined();
		runner.stop();
	});
});
