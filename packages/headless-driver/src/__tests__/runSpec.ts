import { RunnerV1, RunnerV1Game } from "@akashic/headless-driver-runner-v1";
import { RunnerV2, RunnerV2Game } from "@akashic/headless-driver-runner-v2";
import * as path from "path";
import { setSystemLogger } from "../Logger";
import { PlayManager } from "../play/PlayManager";
import { RunnerManager } from "../runner/RunnerManager";
import { activePermission, passivePermission } from "./constants";
import { MockRunnerManager } from "./helpers/MockRunnerManager";
import { SilentLogger } from "./helpers/SilentLogger";

const contentUrlV1 = process.env.CONTENT_URL_V1;
const contentUrlV2 = process.env.CONTENT_URL_V2;
const cascadeContentUrlV2 = process.env.CASCADE_CONTENT_URL_V2;

setSystemLogger(new SilentLogger());

describe("ホスティングされたコンテンツの動作テスト", () => {
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
		expect(runner.external).toEqual({});

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
		expect(runner.external).toEqual({ ext: "0" });

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
			contentUrl: cascadeContentUrlV2
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

describe("ローカルコンテンツの動作テスト", () => {
	it("ローカルの game.json から V1 コンテンツを起動できる", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			gameJsonPath: path.resolve(__dirname, "fixtures", "content-v1", "game.json")
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new RunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active"
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV2;
		expect(runner.external).toEqual({});

		const handleData = () =>
			new Promise<any>((resolve, reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.handle((l: any) => {
					resolve(l);
					return true;
				});
			});

		try {
			await runner.start();
			const data = await handleData();
			expect(data).toBe("reached right");
		} finally {
			runner.stop();
		}
	});
	it("ローカルの game.json から V2 コンテンツを起動できる", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			gameJsonPath: path.resolve(__dirname, "fixtures", "content-v2", "game.json")
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new RunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active"
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV2;
		expect(runner.external).toEqual({ ext: "0" });

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

	it("Akashic V1 のコンテンツは NodeVM 上で実行されている", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			gameJsonPath: path.resolve(__dirname, "fixtures", "content-v1", "game.refers.process.json")
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new RunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active"
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV1;

		const errorCalledFn = jest.fn();
		const handleError = async () => {
			return new Promise<any>(async (resolve, reject) => {
				runner.errorTrigger.handle((e: any) => {
					errorCalledFn();
					resolve(e);
				});
				await runner.start();
			});
		};

		const error = await handleError();
		expect(errorCalledFn).toHaveBeenCalled();
		expect(error instanceof Error).toBeTruthy();
		runner.stop();
	});

	it("Akashic V2 のコンテンツは NodeVM 上で実行されている", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			gameJsonPath: path.resolve(__dirname, "fixtures", "content-v2", "game.refers.process.json")
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new RunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active"
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV2;

		const errorCalledFn = jest.fn();
		const handleError = () => {
			return new Promise<any>(async (resolve, reject) => {
				runner.errorTrigger.add((e: any) => {
					errorCalledFn();
					resolve(e);
				});
				await runner.start();
			});
		};

		const error = await handleError();
		expect(errorCalledFn).toHaveBeenCalled();
		expect(error instanceof Error).toBeTruthy();
		runner.stop();
	});

	it("Akashic V1 のコンテンツは NodeVM 上で実行されていて、コンテンツでfsの使用を防げる。", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			gameJsonPath: path.resolve(__dirname, "fixtures", "content-v1", "game.refers.fs.json")
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new RunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active"
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV1;
		(runnerManager as any).nvm.run("global._require = require");

		const errorCalledFn = jest.fn();
		const handleError = async () => {
			return new Promise<any>(async (resolve, reject) => {
				runner.errorTrigger.handle((e: any) => {
					errorCalledFn();
					resolve(e);
				});
				await runner.start();
			});
		};

		const error = await handleError();
		expect(errorCalledFn).toHaveBeenCalled();
		expect(error instanceof Error).toBeTruthy();
		runner.stop();
	});

	it("Akashic V2 のコンテンツは NodeVM 上で実行されていて、コンテンツでfsの使用を防げる。", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			gameJsonPath: path.resolve(__dirname, "fixtures", "content-v2", "game.refers.fs.json")
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new RunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active"
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV2;
		(runnerManager as any).nvm.run("global._require = require");

		const errorCalledFn = jest.fn();
		const handleError = () => {
			return new Promise<any>(async (resolve, reject) => {
				runner.errorTrigger.add((e: any) => {
					errorCalledFn();
					resolve(e);
				});
				await runner.start();
			});
		};

		const error = await handleError();
		expect(errorCalledFn).toHaveBeenCalled();
		expect(error instanceof Error).toBeTruthy();
		runner.stop();
	});

	it("Akashic V1 のコンテンツは NodeVM 上で実行されていて、コンテンツでhttpの使用を防げる。", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			gameJsonPath: path.resolve(__dirname, "fixtures", "content-v1", "game.refers.http.json")
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new RunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active"
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV1;
		(runnerManager as any).nvm.run("global._require = require");

		const errorCalledFn = jest.fn();
		const handleError = async () => {
			return new Promise<any>(async (resolve, reject) => {
				runner.errorTrigger.handle((e: any) => {
					errorCalledFn();
					resolve(e);
				});
				await runner.start();
			});
		};

		const error = await handleError();
		expect(errorCalledFn).toHaveBeenCalled();
		expect(error instanceof Error).toBeTruthy();
		runner.stop();
	});

	it("Akashic V2 のコンテンツは NodeVM 上で実行されていて、コンテンツでhttpの使用を防げる。", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			gameJsonPath: path.resolve(__dirname, "fixtures", "content-v2", "game.refers.http.json")
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new RunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active"
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV2;
		(runnerManager as any).nvm.run("global._require = require");

		const errorCalledFn = jest.fn();
		const handleError = () => {
			return new Promise<any>(async (resolve, reject) => {
				runner.errorTrigger.add((e: any) => {
					errorCalledFn();
					resolve(e);
				});
				await runner.start();
			});
		};

		const error = await handleError();
		expect(errorCalledFn).toHaveBeenCalled();
		expect(error instanceof Error).toBeTruthy();
		runner.stop();
	});
});
