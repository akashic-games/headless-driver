import * as fs from "fs";
import * as path from "path";
import { setTimeout } from "timers/promises";
import type { Runner, RunnerV1, RunnerV1Game, RunnerV2, RunnerV2Game, RunnerV3, RunnerV3Game } from "../";
import { RunnerV1_g, RunnerV2_g, RunnerV3_g } from "../";
import { getSystemLogger } from "../Logger";
import { PlayManager } from "../play/PlayManager";
import { activePermission, passivePermission } from "./constants";
import { MockRunnerManager } from "./helpers/MockRunnerManager";
import { SilentLogger } from "./helpers/SilentLogger";

const gameJsonUrlV1 = process.env.GAME_JSON_URL_V1!;
const gameJsonUrlV2 = process.env.GAME_JSON_URL_V2!;
const gameJsonUrlV3 = process.env.GAME_JSON_URL_V3!;
const contentUrlV1 = process.env.CONTENT_URL_V1!;
const contentUrlV2 = process.env.CONTENT_URL_V2!;
const contentUrlV3 = process.env.CONTENT_URL_V3!;

async function readyRunner(gameJsonPath: string): Promise<(RunnerV1 | RunnerV2 | RunnerV3) | null> {
	// NOTE: 環境変数 ENGINE_FILES_V3_PATH の設定よりも後にモジュールを読み込むために dynamic import を利用
	/* eslint-disable @typescript-eslint/naming-convention */
	const PlayManager = (await import("../play/PlayManager")).PlayManager;
	const RunnerManager = (await import("../runner/RunnerManager")).RunnerManager;
	const setSystemLogger = (await import("../Logger")).setSystemLogger;
	setSystemLogger(new SilentLogger());
	/* eslint-enable @typescript-eslint/naming-convention */

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
	it("RunnerV1_g が参照できることを確認", () => {
		expect(RunnerV1_g.Util.charCodeAt("a", 0)).toBe(97);
	});

	it("Runner#pause() / resume() でコンテンツが一時停止・再開できる", async () => {
		const runner = (await readyRunner(gameJsonUrlV1)) as RunnerV1;

		const updateLogs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") updateLogs.push(l);
		});

		const game = (await runner.start({ paused: true })) as RunnerV1Game;
		await runner.advanceUntil(() => game.scene()!.name === "content-v1-entry-scene");

		await setTimeout(500);
		expect(updateLogs.length).toBe(0);

		runner.resume();

		await setTimeout(500);
		runner.pause();
		const logCount = updateLogs.length;
		expect(logCount).toBeGreaterThan(10); // 500ms + 30fps で必ず進むであろうフレーム数

		await setTimeout(100);
		expect(updateLogs.length).toBeGreaterThanOrEqual(logCount); // 停止したままであることを確認

		runner.stop();
	});

	it("Runner#step() で 1 ティックごとにコンテンツが進行できる", async () => {
		const runner = (await readyRunner(gameJsonUrlV1)) as RunnerV1;

		const game = (await runner.start({ paused: true })) as RunnerV1Game;
		await runner.advanceUntil(() => game.scene()!.name === "content-v1-entry-scene");

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

		const game = (await runner.start({ paused: true })) as RunnerV1Game;
		await runner.advanceUntil(() => game.scene()!.name === "content-v1-entry-scene");

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

		const game = (await runner.start({ paused: true })) as RunnerV1Game;
		await runner.advanceUntil(() => game.scene()!.name === "content-v1-entry-scene");

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
	it("RunnerV2_g が参照できることを確認", () => {
		expect(RunnerV2_g.Util.charCodeAt("a", 0)).toBe(97);
	});

	it("Runner#pause() / resume() でコンテンツが一時停止・再開できる", async () => {
		const runner = (await readyRunner(gameJsonUrlV2)) as RunnerV2;

		const updateLogs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") updateLogs.push(l);
		});

		const game = (await runner.start({ paused: true })) as RunnerV2Game;
		await runner.advanceUntil(() => game.scene()!.name === "content-v2-entry-scene");

		await setTimeout(500);
		expect(updateLogs.length).toBe(0);

		runner.resume();

		await setTimeout(500);
		runner.pause();
		const logCount = updateLogs.length;
		expect(logCount).toBeGreaterThan(10); // 500ms + 30fps で必ず進むであろうフレーム数

		await setTimeout(100);
		expect(updateLogs.length).toBeGreaterThanOrEqual(logCount); // 停止したままであることを確認

		runner.stop();
	});

	it("Runner#step() で 1 ティックごとにコンテンツが進行できる", async () => {
		const runner = (await readyRunner(gameJsonUrlV2)) as RunnerV2;

		const game = (await runner.start({ paused: true })) as RunnerV2Game;
		await runner.advanceUntil(() => game.scene()!.name === "content-v2-entry-scene");

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

		const game = (await runner.start({ paused: true })) as RunnerV2Game;
		await runner.advanceUntil(() => game.scene()!.name === "content-v2-entry-scene");

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

	it("Runner#advance() でコンテンツが進行できる (60 s)", async () => {
		const runner = (await readyRunner(gameJsonUrlV2)) as RunnerV2;

		const game = (await runner.start({ paused: true })) as RunnerV2Game;
		await runner.advanceUntil(() => game.scene()!.name === "content-v2-entry-scene");

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
	it("RunnerV3_g が参照できることを確認", () => {
		expect(RunnerV3_g.Util.charCodeAt("a", 0)).toBe(97);
	});

	it("Runner#pause() / resume() でコンテンツが一時停止・再開できる", async () => {
		const runner = (await readyRunner(gameJsonUrlV3)) as RunnerV3;

		const updateLogs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") updateLogs.push(l);
		});

		const game = (await runner.start({ paused: true })) as RunnerV3Game;
		await runner.advanceUntil(() => game.scene()!.name === "content-v3-entry-scene");

		await setTimeout(500);
		expect(updateLogs.length).toBe(0);

		runner.resume();

		await setTimeout(500);
		runner.pause();
		const logCount = updateLogs.length;
		expect(logCount).toBeGreaterThan(10); // 500ms + 30fps で必ず進むであろうフレーム数

		await setTimeout(100);
		expect(updateLogs.length).toBeGreaterThanOrEqual(logCount); // 停止したままであることを確認

		runner.stop();
	});

	it("Runner#step() で 1 ティックごとにコンテンツが進行できる", async () => {
		const runner = (await readyRunner(gameJsonUrlV3)) as RunnerV3;

		const game = (await runner.start({ paused: true })) as RunnerV3Game;
		await runner.advanceUntil(() => game.scene()!.name === "content-v3-entry-scene");

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
		const runner = (await readyRunner(gameJsonUrlV3)) as RunnerV3;

		const game = (await runner.start({ paused: true })) as RunnerV3Game;
		await runner.advanceUntil(() => game.scene()!.name === "content-v3-entry-scene");

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

	it("Runner#advance() でコンテンツが進行できる (60 s)", async () => {
		const runner = (await readyRunner(gameJsonUrlV3)) as RunnerV3;

		const game = (await runner.start({ paused: true })) as RunnerV3Game;
		await runner.advanceUntil(() => game.scene()!.name === "content-v3-entry-scene");

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

describe("Runner の engine-files 上書き動作確認", () => {
	beforeEach(() => {
		jest.resetModules();
	});

	afterEach(() => {
		delete process.env.ENGINE_FILES_V3_PATH;
	});

	it("環境変数を利用して debug 用の engineFiles を上書きできる", async () => {
		const engineFilesFromPath = path.join(__dirname, "fixtures", "engineFilesV3", "engineFilesV3_7_3.debug.js");
		const engineFilesToPath = path.join(__dirname, "tmp", "engineFilesV3_7_3.debug.js");
		const engineFilesStr = fs.readFileSync(engineFilesFromPath);

		// 読み込まれていることを確認するためテストコードを仕込んでおく
		const randStr = Date.now() + "";
		fs.writeFileSync(engineFilesToPath, `globalThis.__test_${randStr}__ = true; \n\n` + engineFilesStr);

		process.env.ENGINE_FILES_V3_PATH = engineFilesToPath;

		const runner = (await readyRunner(gameJsonUrlV3)) as RunnerV3;

		const game = (await runner.start({ paused: true })) as RunnerV3Game;
		await runner.advanceUntil(() => game.scene()!.name === "content-v3-entry-scene");

		const logs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") logs.push(l);
		});

		await runner.step();
		await runner.step();
		await runner.step();
		expect(logs).toEqual(["scene_update", "scene_update", "scene_update"]);
		expect((globalThis as any)[`__test_${randStr}__`]).toBe(true);

		runner.stop();
	});

	it("環境変数を利用して release 用の engineFiles を上書きできる", async () => {
		const engineFilesFromPath = path.join(__dirname, "fixtures", "engineFilesV3", "engineFilesV3_7_3.release.js");
		const engineFilesToPath = path.join(__dirname, "tmp", "engineFilesV3_7_3.release.js");
		const engineFilesStr = fs.readFileSync(engineFilesFromPath);

		// 読み込まれていることを確認するためテストコードを仕込んでおく
		const randStr = Date.now() + "";
		fs.writeFileSync(engineFilesToPath, `globalThis.__test_${randStr}__ = true;\n\n` + engineFilesStr);

		process.env.ENGINE_FILES_V3_PATH = engineFilesToPath;

		const runner = (await readyRunner(gameJsonUrlV3)) as RunnerV3;

		const game = (await runner.start({ paused: true })) as RunnerV3Game;
		await runner.advanceUntil(() => game.scene()!.name === "content-v3-entry-scene");

		const logs: string[] = [];
		runner.sendToExternalTrigger.add((l) => {
			if (l === "scene_update") logs.push(l);
		});

		await runner.step();
		await runner.step();
		await runner.step();
		expect(logs).toEqual(["scene_update", "scene_update", "scene_update"]);
		expect((globalThis as any)[`__test_${randStr}__`]).toBe(true);

		runner.stop();
	});
});

describe("Runner の動作確認 (異常系)", () => {
	it("(v1) Runner#pause() せずに Runner#advance() を呼ぶことはできない", async () => {
		const runner = (await readyRunner(gameJsonUrlV1)) as RunnerV1;
		await runner.start();
		await setTimeout(500);
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
		await setTimeout(500);
		let err: any;
		runner.errorTrigger.add((e) => {
			err = e;
		});
		await runner.step();
		// trigger 経由でエラーが通知されることを確認
		expect(err).not.toBeUndefined();
		runner.stop();
	});

	it("(v2) Runner#pause() せずに Runner#advance() を呼ぶことはできない", async () => {
		const runner = (await readyRunner(gameJsonUrlV2)) as RunnerV2;
		await runner.start();
		await setTimeout(500);
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
		await setTimeout(500);
		let err: any;
		runner.errorTrigger.add((e) => {
			err = e;
		});
		await runner.step();
		// trigger 経由でエラーが通知されることを確認
		expect(err).not.toBeUndefined();
		runner.stop();
	});

	it("(v3) Runner#pause() せずに Runner#advance() を呼ぶことはできない", async () => {
		const runner = (await readyRunner(gameJsonUrlV3)) as RunnerV3;
		await runner.start();
		await setTimeout(500);
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
		await setTimeout(500);
		let err: any;
		runner.errorTrigger.add((e) => {
			err = e;
		});
		await runner.step();
		// trigger 経由でエラーが通知されることを確認
		expect(err).not.toBeUndefined();
		runner.stop();
	});
});

describe("複数 Runner の動作確認", () => {
	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	async function createRunners(contentUrl: string) {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl
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
			executionMode: "active",
			allowedUrls: null
		});

		const passiveRunnerId = await runnerManager.createRunner({
			playId,
			amflow: passiveAMFlow,
			playToken: passivePlayToken,
			executionMode: "passive",
			allowedUrls: null
		});

		const activeRunner = runnerManager.getRunner(activeRunnerId) as Runner;
		const passiveRunner = runnerManager.getRunner(passiveRunnerId) as Runner;

		return { activeRunner, passiveRunner };
	}

	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	async function doAdvanceLatestTest(contentUrl: string) {
		const { activeRunner, passiveRunner } = await createRunners(contentUrl);

		const activeGame = await activeRunner.start();
		const passiveGame = await passiveRunner.start({ paused: true });

		await setTimeout(1000);
		activeRunner.pause();

		expect(activeGame!.age).toBeGreaterThan(passiveGame!.age);

		await passiveRunner.advanceLatest();
		expect(activeGame!.age).toBe(passiveGame!.age);

		await passiveRunner.advanceLatest();

		const warnSpy = jest.spyOn(getSystemLogger(), "warn");
		await activeRunner.advanceLatest();
		expect(warnSpy).toHaveBeenCalled();
		expect(warnSpy.mock.calls[0][0]).toContain(
			"advanceLatest() is only available when executionMode is 'passive' and loopMode is 'realtime'"
		);
		warnSpy.mockRestore();

		activeRunner.stop();
		passiveRunner.stop();
	}

	it("Akashic V1 コンテンツでは Runner#advanceLatest() が利用できないことを確認", async () => {
		const { activeRunner, passiveRunner } = await createRunners(contentUrlV1);
		await setTimeout(1000);
		activeRunner.pause();

		const errorSpy = jest.fn();
		passiveRunner.errorTrigger.add((err: Error) => {
			errorSpy(err);
		});
		await passiveRunner.advanceLatest();
		expect(errorSpy).toHaveBeenCalled();
		expect(errorSpy.mock.calls[0][0].message).toContain("advanceLatest() is not supported in RunnerV1");

		activeRunner.stop();
		passiveRunner.stop();
	});

	it("Akashic V2 コンテンツで Runner#advanceLatest() を利用して Passive が Active に追いつくことを確認", async () => {
		await doAdvanceLatestTest(contentUrlV2);
	});

	it("Akashic V3 コンテンツで Runner#advanceLatest() を利用して Passive が Active に追いつくことを確認", async () => {
		await doAdvanceLatestTest(contentUrlV3);
	});
});
