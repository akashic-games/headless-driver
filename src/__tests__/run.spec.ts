import * as path from "path";
import type { RunnerV1, RunnerV1Game, RunnerV2, RunnerV2Game, RunnerV3, RunnerV3Game } from "..";
import { setSystemLogger } from "../Logger";
import { PlayManager } from "../play/PlayManager";
import { RunnerManager } from "../runner/RunnerManager";
import { activePermission, passivePermission } from "./constants";
import { MockRunnerManager } from "./helpers/MockRunnerManager";
import { SilentLogger } from "./helpers/SilentLogger";

const contentUrlV1 = process.env.CONTENT_URL_V1!;
const contentUrlV2 = process.env.CONTENT_URL_V2!;
const contentUrlV3 = process.env.CONTENT_URL_V3!;
const extContentUrlV1 = process.env.EXT_CONTENT_URL_V1;
const extContentUrlV2 = process.env.EXT_CONTENT_URL_V2;
const extContentUrlV3 = process.env.EXT_CONTENT_URL_V3;
const cascadeContentUrlV2 = process.env.CASCADE_CONTENT_URL_V2!;
const assetBaseUrlV1 = process.env.ASSET_BASE_URL_V1!;
const assetBaseUrlV2 = process.env.ASSET_BASE_URL_V2!;
const assetBaseUrlV3 = process.env.ASSET_BASE_URL_V3!;
const extAssetBaseUrlV1 = process.env.EXT_ASSET_BASE_URL_V1!;
const extAssetBaseUrlV2 = process.env.EXT_ASSET_BASE_URL_V2!;
const extAssetBaseUrlV3 = process.env.EXT_ASSET_BASE_URL_V3!;

setSystemLogger(new SilentLogger());

describe("untrusted コンテンツの動作テスト (URL)", () => {
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
			executionMode: "active",
			allowedUrls: null,
			externalValue: { hoge: () => "hoge1", foo: () => "foo1" }
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV1;
		expect(runner.runnerId).toBe("0");
		expect(runner.engineVersion).toBe("1");
		expect(runner.external).toEqual({});

		const game = (await runnerManager.startRunner(runner.runnerId)) as RunnerV1Game;
		expect(game.playId).toBe(playId);
		expect(game.external.hoge()).toBe("hoge1");
		expect(game.external.foo()).toBe("foo1");

		const handleData = (): Promise<any> =>
			new Promise<any>((resolve, _reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.handle((l: any) => {
					resolve(l);
					return true;
				});
			});

		const data = await handleData();
		expect(data).toBe("reached right");

		// インスタンスの生成元が同一であることを確認
		expect(game instanceof runner.g.Game).toBe(true);
		expect(game.scene() instanceof runner.g.Scene).toBe(true);

		// コンテンツ側へのポイントイベントの発火が正しく機能している
		runner.firePointEvent({
			type: "down",
			identifier: 0,
			offset: { x: 10, y: 10 }
		});
		expect(
			await new Promise<string>((resolve, _reject) => {
				runner.sendToExternalTrigger.addOnce((l: string) => {
					resolve(l);
				});
			})
		).toBe("fired point down event");

		runner.firePointEvent({
			type: "move",
			identifier: 0,
			offset: { x: 15, y: 10 }
		});
		expect(
			await new Promise<string>((resolve, _reject) => {
				runner.sendToExternalTrigger.addOnce((l: string) => {
					resolve(l);
				});
			})
		).toBe("fired point move event");

		runner.firePointEvent({
			type: "up",
			identifier: 0,
			offset: { x: 20, y: 10 }
		});
		expect(
			await new Promise<string>((resolve, _reject) => {
				runner.sendToExternalTrigger.addOnce((l: string) => {
					resolve(l);
				});
			})
		).toBe("fired point up event");

		const handleError = (): Promise<any> =>
			new Promise<any>((resolve, _reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.handle((l: any) => {
					resolve(l);
					return true;
				});
			});

		// AMFlow 経由でイベントを送信でき、それをコンテンツで捕捉できる
		activeAMFlow.sendEvent([0x20, 0, ":akashic", { hoge: "fuga" }]);

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
			executionMode: "active",
			allowedUrls: null,
			externalValue: { hoge: () => "hoge2", foo: () => "foo2" }
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV2;
		expect(runner.runnerId).toBe("0");
		expect(runner.engineVersion).toBe("2");
		expect(runner.external).toEqual({ ext: "0" });

		const game = (await runnerManager.startRunner(runner.runnerId)) as RunnerV2Game;
		expect(game.playId).toBe(playId);
		expect(game.external.hoge()).toBe("hoge2");
		expect(game.external.foo()).toBe("foo2");

		const handleData = (): Promise<any> =>
			new Promise<any>((resolve, _reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.addOnce((l) => {
					resolve(l);
				});
			});

		const data = await handleData();
		expect(data).toBe("reached right");

		// インスタンスの生成元が同一であることを確認
		expect(game instanceof runner.g.Game).toBe(true);
		expect(game.scene() instanceof runner.g.Scene).toBe(true);

		// コンテンツ側へのポイントイベントの発火が正しく機能している
		runner.firePointEvent({
			type: "down",
			identifier: 0,
			offset: { x: 10, y: 10 }
		});
		expect(
			await new Promise<string>((resolve, _reject) => {
				runner.sendToExternalTrigger.addOnce((l: string) => {
					resolve(l);
				});
			})
		).toBe("fired point down event");

		runner.firePointEvent({
			type: "move",
			identifier: 0,
			offset: { x: 15, y: 10 }
		});
		expect(
			await new Promise<string>((resolve, _reject) => {
				runner.sendToExternalTrigger.addOnce((l: string) => {
					resolve(l);
				});
			})
		).toBe("fired point move event");

		runner.firePointEvent({
			type: "up",
			identifier: 0,
			offset: { x: 20, y: 10 }
		});
		expect(
			await new Promise<string>((resolve, _reject) => {
				runner.sendToExternalTrigger.addOnce((l: string) => {
					resolve(l);
				});
			})
		).toBe("fired point up event");

		const handleEvent = (): Promise<any> =>
			new Promise<any>((resolve, _reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.addOnce((l) => {
					resolve(l);
				});
			});

		// AMFlow 経由でイベントを送信でき、それをコンテンツで捕捉できる
		activeAMFlow.sendEvent([0x20, 0, ":akashic", { hoge: "fuga" }]);

		// 読み込んだコンテンツで受信したメッセージイベントを出力しているので、ここで内容を取得する
		const event = await handleEvent();
		expect(event.data).toEqual({ hoge: "fuga" });
		expect(event.player.id).toBe(":akashic");
		runner.stop();
	});

	it("Akashic V3 のコンテンツが動作できる", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV3
		});

		const activeAMFlow = playManager.createAMFlow(playId);
		expect(activeAMFlow.playId).toBe(playId);

		const playToken = playManager.createPlayToken(playId, activePermission);

		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active",
			allowedUrls: null,
			externalValue: { hoge: () => "hoge3", foo: () => "foo3" }
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV3;
		expect(runner.runnerId).toBe("0");
		expect(runner.engineVersion).toBe("3");
		expect(runner.external).toEqual({ ext: "0" });

		const game = (await runnerManager.startRunner(runner.runnerId)) as RunnerV3Game;
		expect(game.playId).toBe(playId);
		expect(game.external.hoge()).toBe("hoge3");
		expect(game.external.foo()).toBe("foo3");

		const handleData = (): Promise<any> =>
			new Promise<any>((resolve) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.addOnce((l) => {
					resolve(l);
				});
			});

		const data = await handleData();
		expect(data).toBe("reached right");

		// インスタンスの生成元が同一であることを確認
		expect(game instanceof runner.g.Game).toBe(true);
		expect(game.scene() instanceof runner.g.Scene).toBe(true);

		// コンテンツ側へのポイントイベントの発火が正しく機能している
		runner.firePointEvent({
			type: "down",
			identifier: 0,
			offset: { x: 10, y: 10 }
		});
		expect(
			await new Promise<string>((resolve, _reject) => {
				runner.sendToExternalTrigger.addOnce((l: string) => {
					resolve(l);
				});
			})
		).toBe("fired point down event");

		runner.firePointEvent({
			type: "move",
			identifier: 0,
			offset: { x: 15, y: 10 }
		});
		expect(
			await new Promise<string>((resolve, _reject) => {
				runner.sendToExternalTrigger.addOnce((l: string) => {
					resolve(l);
				});
			})
		).toBe("fired point move event");

		runner.firePointEvent({
			type: "up",
			identifier: 0,
			offset: { x: 20, y: 10 }
		});
		expect(
			await new Promise<string>((resolve, _reject) => {
				runner.sendToExternalTrigger.addOnce((l: string) => {
					resolve(l);
				});
			})
		).toBe("fired point up event");

		const handleEvent = (): Promise<any> =>
			new Promise<any>((resolve) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.addOnce((l) => {
					resolve(l);
				});
			});

		// AMFlow 経由でイベントを送信でき、それをコンテンツで捕捉できる
		activeAMFlow.sendEvent([0x20, 0, ":akashic", { hoge: "fuga" }]);

		// 読み込んだコンテンツで受信したメッセージイベントを出力しているので、ここで内容を取得する
		const event = await handleEvent();
		expect(event.data).toEqual({ hoge: "fuga" });
		expect(event.player.id).toBe(":akashic");

		// コンテンツ側で ScriptAsset#exports が機能しているかを確認
		activeAMFlow.sendEvent([0x20, 0, ":akashic", { type: "load_script_asset_exports" }]);
		expect(
			await new Promise<number>((resolve, _reject) => {
				runner.sendToExternalTrigger.addOnce((l: number) => {
					resolve(l);
				});
			})
		).toBe(43);

		// コンテンツ側でバイナリアセットが読み込めているかを確認
		activeAMFlow.sendEvent([0x20, 0, ":akashic", { type: "load_binary_asset_data" }]);
		expect(
			await new Promise<ArrayBuffer>((resolve, _reject) => {
				runner.sendToExternalTrigger.addOnce((l: ArrayBuffer) => {
					resolve(l);
				});
			})
		).toBe("akashic!!");

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

		const activeRunner = runnerManager.getRunner(activeRunnerId) as RunnerV2;
		const passiveRunner = runnerManager.getRunner(passiveRunnerId) as RunnerV2;
		await runnerManager.startRunner(activeRunner.runnerId);
		await runnerManager.startRunner(passiveRunner.runnerId);

		// (1) AMFlow 経由で Passive のコンテンツにメッセージを送信させる
		passiveAMFlow.sendEvent([0x20, 0, ":akashic", { type: "send_event" }]);

		// (2) (1) 送信後に Active 側のメッセージ受信ハンドラを登録
		// NOTE: "data_from_content" 以外のメッセージイベントの捕捉を防ぐため、このタイミングで出力をハンドルする
		const handleData = (): Promise<any> =>
			new Promise<any>((resolve, _reject) => {
				// NOTE: 読み込んだコンテンツ側で受信したメッセージイベントを出力しているので、ここで内容を取得する
				activeRunner.sendToExternalTrigger.addOnce((l) => {
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
			executionMode: "active",
			allowedUrls: null
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV2;

		const handleData = (): Promise<any> =>
			new Promise<any>((resolve, _reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.addOnce((l) => {
					resolve(l);
				});
			});

		await runner.start();

		const data = await handleData();
		expect(data).toBe("reached right");
		runner.stop();
	});

	it("Akashic V1 で allowedUrls に指定した外部アセットを読み込める", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV1
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active",
			allowedUrls: [assetBaseUrlV1, extAssetBaseUrlV1]
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV2;
		await runner.start();

		const handleEvent = (): Promise<any> =>
			new Promise<any>((resolve, _reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.handle((l: any) => {
					if (l === "loaded_external_asset") {
						resolve(l);
						return true;
					}
				});
			});

		activeAMFlow.sendEvent([0x20, 0, ":akashic", { type: "load_external_asset", url: extContentUrlV1 }]);

		const event = await handleEvent();
		expect(event).toBe("loaded_external_asset");
		runner.stop();
	});

	it("Akashic V2 で allowedUrls に指定した外部アセットを読み込める", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV2
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active",
			allowedUrls: [assetBaseUrlV2, extAssetBaseUrlV2]
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV2;
		await runner.start();

		const handleEvent = (): Promise<any> =>
			new Promise<any>((resolve, _reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.add((l) => {
					if (l === "loaded_external_asset") {
						resolve(l);
						return true;
					}
				});
			});

		activeAMFlow.sendEvent([0x20, 0, ":akashic", { type: "load_external_asset", url: extContentUrlV2 }]);

		const event = await handleEvent();
		expect(event).toBe("loaded_external_asset");
		runner.stop();
	});

	it("Akashic V3 で allowedUrls に指定した外部アセットを読み込める", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV3
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active",
			allowedUrls: [assetBaseUrlV3, extAssetBaseUrlV3]
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV3;
		await runner.start();

		const handleEvent = (): Promise<any> =>
			new Promise<any>((resolve) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.add((l) => {
					if (l === "loaded_external_asset") {
						resolve(l);
						return true;
					}
				});
			});

		activeAMFlow.sendEvent([0x20, 0, ":akashic", { type: "load_external_asset", url: extContentUrlV3 }]);

		const event = await handleEvent();
		expect(event).toBe("loaded_external_asset");
		runner.stop();
	});
});

describe("untrusted コンテンツの動作テスト (ローカルパス)", () => {
	it("ローカルの game.json から Akashic V1 コンテンツを起動できる", async () => {
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
			executionMode: "active",
			allowedUrls: null,
			externalValue: { hoge: () => "hoge1", foo: () => "foo1" }
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV2;
		expect(runner.external).toEqual({});

		const handleData = (): Promise<any> =>
			new Promise<any>((resolve, _reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.handle((l: any) => {
					resolve(l);
					return true;
				});
			});

		const game = (await runner.start())!;
		const data = await handleData();
		expect(data).toBe("reached right");
		expect(game.external.hoge()).toBe("hoge1");
		expect(game.external.foo()).toBe("foo1");

		expect(game instanceof runner.g.Game).toBe(true);
		expect(game.scene() instanceof runner.g.Scene).toBe(true);

		runner.stop();
	});

	it("ローカルの game.json から Akashic V2 コンテンツを起動できる", async () => {
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
			executionMode: "active",
			allowedUrls: null,
			externalValue: { hoge: () => "hoge2", foo: () => "foo2" }
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV2;
		expect(runner.external).toEqual({ ext: "0" });

		const handleData = (): Promise<any> =>
			new Promise<any>((resolve, _reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.addOnce((l) => {
					resolve(l);
				});
			});

		const game = (await runner.start())!;
		const data = await handleData();
		expect(data).toBe("reached right");
		expect(game.external.hoge()).toBe("hoge2");
		expect(game.external.foo()).toBe("foo2");

		expect(game instanceof runner.g.Game).toBe(true);
		expect(game.scene() instanceof runner.g.Scene).toBe(true);

		runner.stop();
	});

	it("ローカルの game.json から Akashic V3 コンテンツを起動できる", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			gameJsonPath: path.resolve(__dirname, "fixtures", "content-v3", "game.json")
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
			externalValue: { hoge: () => "hoge3", foo: () => "foo3" }
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV3;
		expect(runner.external).toEqual({ ext: "0" });

		const handleData = (): Promise<any> =>
			new Promise<any>((resolve) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.addOnce((l) => {
					resolve(l);
				});
			});

		const game = (await runner.start())!;
		const data = await handleData();
		expect(data).toBe("reached right");
		expect(game.external.hoge()).toBe("hoge3");
		expect(game.external.foo()).toBe("foo3");

		expect(game instanceof runner.g.Game).toBe(true);
		expect(game.scene() instanceof runner.g.Scene).toBe(true);

		runner.stop();
	});
});

describe("untrusted コンテンツの動作テスト: 異常系", () => {
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
				executionMode: "active",
				allowedUrls: null
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
			executionMode: "active",
			allowedUrls: null
		});

		const runner = runnerManager.getRunner(runnerId) as RunnerV1;
		await runnerManager.startRunner(runnerId);

		const handleError = (): Promise<any> =>
			new Promise<any>((resolve, _reject) => {
				runner.errorTrigger.handle((e: any) => {
					resolve(e);
					return true;
				});
			});

		// AMFlow 経由でコンテンツに例外を投げさせる
		activeAMFlow.sendEvent([0x20, 0, ":akashic", { type: "throw_error" }]);

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
			executionMode: "active",
			allowedUrls: null
		});

		const runner = runnerManager.getRunner(runnerId) as RunnerV2;
		await runnerManager.startRunner(runner.runnerId);

		const handleError = (): Promise<any> =>
			new Promise<any>((resolve, _reject) => {
				runner.errorTrigger.add((e: any) => {
					resolve(e);
					return true;
				});
			});

		// AMFlow 経由でコンテンツに例外を投げさせる
		activeAMFlow.sendEvent([0x20, 0, ":akashic", { type: "throw_error" }]);

		const error = await handleError();
		expect(error.message).toBe("unknown error");

		runner.stop();
	});

	it("Akashic V3 のコンテンツ内での例外を捕捉できる", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV3
		});

		const activeAMFlow = playManager.createAMFlow(playId);
		expect(activeAMFlow.playId).toBe(playId);

		const playToken = playManager.createPlayToken(playId, activePermission);

		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active",
			allowedUrls: null
		});

		const runner = runnerManager.getRunner(runnerId) as RunnerV3;
		await runnerManager.startRunner(runner.runnerId);

		const handleError = (): Promise<any> =>
			new Promise<any>((resolve) => {
				runner.errorTrigger.add((e: any) => {
					resolve(e);
					return true;
				});
			});

		// AMFlow 経由でコンテンツに例外を投げさせる
		activeAMFlow.sendEvent([0x20, 0, ":akashic", { type: "throw_error" }]);

		const error = await handleError();
		expect(error.message).toBe("unknown error");

		runner.stop();
	});

	it("Akashic V1 のコンテンツで process が参照できないことを確認", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV1
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active",
			allowedUrls: null
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV1;
		await runnerManager.startRunner(runner.runnerId);

		const errorCalledFn = jest.fn();
		const handleError = (): Promise<any> => {
			return new Promise<any>((resolve, _reject) => {
				runner.errorTrigger.add((e: any) => {
					errorCalledFn();
					resolve(e);
				});
			});
		};
		// AMFlow 経由でコンテンツに例外を投げさせる
		activeAMFlow.sendEvent([0x20, 0, ":akashic", { type: "process" }]);

		const error = await handleError();
		expect(errorCalledFn).toHaveBeenCalled();
		expect(error.message).toBe("process is not defined");
		runner.stop();
	});

	it("Akashic V2 のコンテンツで process が参照できないことを確認", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV2
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active",
			allowedUrls: null
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV2;
		await runnerManager.startRunner(runner.runnerId);

		const errorCalledFn = jest.fn();
		const handleError = (): Promise<any> => {
			return new Promise<any>((resolve, _reject) => {
				runner.errorTrigger.add((e: any) => {
					errorCalledFn();
					resolve(e);
				});
			});
		};
		// AMFlow 経由でコンテンツに例外を投げさせる
		activeAMFlow.sendEvent([0x20, 0, ":akashic", { type: "process" }]);

		const error = await handleError();
		expect(errorCalledFn).toHaveBeenCalled();
		expect(error.message).toBe("process is not defined");
		runner.stop();
	});

	it("Akashic V3 のコンテンツで process が参照できないことを確認", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV3
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active",
			allowedUrls: null
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV3;
		await runnerManager.startRunner(runner.runnerId);

		const errorCalledFn = jest.fn();
		const handleError = (): Promise<any> => {
			return new Promise<any>((resolve) => {
				runner.errorTrigger.add((e: any) => {
					errorCalledFn();
					resolve(e);
				});
			});
		};
		// AMFlow 経由でコンテンツに例外を投げさせる
		activeAMFlow.sendEvent([0x20, 0, ":akashic", { type: "process" }]);

		const error = await handleError();
		expect(errorCalledFn).toHaveBeenCalled();
		expect(error.message).toBe("process is not defined");
		runner.stop();
	});

	it("Akashic V1 コンテンツで allowedUrls に指定していない外部アセットは読み込めないことを確認", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV1
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active",
			allowedUrls: [assetBaseUrlV1]
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV1;
		await runnerManager.startRunner(runner.runnerId);

		const handleEvent = (): Promise<any> =>
			new Promise<any>((resolve, _reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.handle((l: any) => {
					if (l === "failed_load_external_asset") {
						resolve(l);
						return true;
					}
				});
			});

		// 許可されていない場所のアセットの読み込みをコンテンツ側で要求
		activeAMFlow.sendEvent([0x20, 0, ":akashic", { type: "load_external_asset", url: extContentUrlV1 }]);

		const event = await handleEvent();
		expect(event).toBe("failed_load_external_asset");
		runner.stop();
	});

	it("Akashic V2 コンテンツで allowedUrls に指定していない外部アセットは読み込めないことを確認", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV2
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active",
			allowedUrls: [assetBaseUrlV2]
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV2;
		await runnerManager.startRunner(runner.runnerId);

		const handleEvent = (): Promise<any> =>
			new Promise<any>((resolve, _reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.add((l) => {
					if (l === "failed_load_external_asset") {
						resolve(l);
						return true;
					}
				});
			});

		// 許可されていない場所のアセットの読み込みをコンテンツ側で要求
		activeAMFlow.sendEvent([0x20, 0, ":akashic", { type: "load_external_asset", url: extContentUrlV2 }]);

		const event = await handleEvent();
		expect(event).toBe("failed_load_external_asset");
		runner.stop();
	});

	it("Akashic V3 コンテンツで allowedUrls に指定していない外部アセットは読み込めないことを確認", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV3
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active",
			allowedUrls: [assetBaseUrlV3]
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV3;
		await runnerManager.startRunner(runner.runnerId);

		const handleEvent = (): Promise<any> =>
			new Promise<any>((resolve) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.add((l) => {
					if (l === "failed_load_external_asset") {
						resolve(l);
						return true;
					}
				});
			});

		// 許可されていない場所のアセットの読み込みをコンテンツ側で要求
		activeAMFlow.sendEvent([0x20, 0, ":akashic", { type: "load_external_asset", url: extContentUrlV2 }]);

		const event = await handleEvent();
		expect(event).toBe("failed_load_external_asset");
		runner.stop();
	});

	it("allowedUrls が先頭一致しない場合は該当の外部アセットを読み込めないことを確認", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV2
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active",
			allowedUrls: [assetBaseUrlV2, extAssetBaseUrlV2]
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV2;
		await runnerManager.startRunner(runner.runnerId);

		const handleEvent = (): Promise<any> =>
			new Promise<any>((resolve, _reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.add((l) => {
					if (l === "failed_load_external_asset") {
						resolve(l);
						return true;
					}
				});
			});

		// 許可されていない場所のアセットの読み込みをコンテンツ側で要求。先頭一致しないURL
		const errorUrl = `http://localhost:3300/content-v2?q=${extContentUrlV2}`;
		activeAMFlow.sendEvent([0x20, 0, ":akashic", { type: "load_external_asset", url: errorUrl }]);

		const event = await handleEvent();
		expect(event).toBe("failed_load_external_asset");
		runner.stop();
	});

	it("allowedUrl の正規表現が一致しない場合は該当の外部アセットを読み込めないことを確認", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV2
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active",
			allowedUrls: [assetBaseUrlV2, /^http:\/\/127.0.0.1:\d+\/content-v2\//] // 行頭指定あり
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV2;
		await runnerManager.startRunner(runner.runnerId);

		const handleEvent = (): Promise<any> =>
			new Promise<any>((resolve, _reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.add((l) => {
					if (l === "failed_load_external_asset") {
						resolve(l);
						return true;
					}
				});
			});

		// 許可されていない場所のアセットの読み込みをコンテンツ側で要求。先頭一致しないURL
		const errorUrl = `http://localhost:3300/content-v2?q=${extContentUrlV2}`;
		activeAMFlow.sendEvent([0x20, 0, ":akashic", { type: "load_external_asset", url: errorUrl }]);

		const event = await handleEvent();
		expect(event).toBe("failed_load_external_asset");
		runner.stop();

		try {
			// allowedUrlsの正規表現は '^' で始まらない場合エラーとなる。
			await runnerManager.createRunner({
				playId,
				amflow: activeAMFlow,
				playToken,
				executionMode: "active",
				allowedUrls: [assetBaseUrlV2, /http:\/\/127.0.0.1:\d+\/content-v2\//] // 行頭指定なし
			});
			fail();
		} catch (err) {
			expect(err.message).toMatch("Regexp must start with '^'");
		}
	});
});

describe("trusted コンテンツの動作テスト", () => {
	it("Akashic V1 のコンテンツが実行できることを確認", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV1
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active",
			allowedUrls: null,
			trusted: true
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV1;

		const fn = jest.fn();
		const handleData = (): Promise<void> =>
			new Promise<void>((resolve, _reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.addOnce((l) => {
					fn();
					resolve(l);
				});
			});

		await runner.start();
		await handleData();
		expect(fn).toBeCalled();
		runner.stop();
	});

	it("Akashic V2 のコンテンツが実行できることを確認", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV2
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active",
			allowedUrls: null,
			trusted: true
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV2;

		const fn = jest.fn();
		const handleData = (): Promise<void> =>
			new Promise<void>((resolve, _reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.addOnce((l) => {
					fn();
					resolve(l);
				});
			});

		await runner.start();
		await handleData();
		expect(fn).toBeCalled();
		runner.stop();
	});

	it("Akashic V3 のコンテンツが実行できることを確認", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV3
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active",
			allowedUrls: null,
			trusted: true
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV3;

		const fn = jest.fn();
		const handleData = (): Promise<void> =>
			new Promise<void>((resolve, _reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.addOnce((l) => {
					fn();
					resolve(l);
				});
			});

		await runner.start();
		await handleData();
		expect(fn).toBeCalled();
		runner.stop();
	});
});

describe("trusted コンテンツの動作テスト: 異常系", () => {
	it("Akashic V1 コンテンツで allowedUrls に指定していない外部アセットは読み込めないことを確認", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV1
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active",
			allowedUrls: [assetBaseUrlV1],
			trusted: true
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV1;
		await runnerManager.startRunner(runner.runnerId);

		const handleEvent = (): Promise<any> =>
			new Promise<any>((resolve, _reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.add((l) => {
					if (l === "failed_load_external_asset") {
						resolve(l);
						return true;
					}
				});
			});

		// 許可されていない場所にある外部アセットの読み込みをコンテンツ側に要求
		activeAMFlow.sendEvent([0x20, 0, ":akashic", { type: "load_external_asset", url: extContentUrlV1 }]);

		const event = await handleEvent();
		expect(event).toBe("failed_load_external_asset");
		runner.stop();
	});

	it("Akashic V2 コンテンツで allowedUrls に指定していない外部アセットは読み込めないことを確認", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV2
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active",
			allowedUrls: [assetBaseUrlV2],
			trusted: true
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV2;
		await runnerManager.startRunner(runner.runnerId);

		const handleEvent = (): Promise<any> =>
			new Promise<any>((resolve, _reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.add((l) => {
					if (l === "failed_load_external_asset") {
						resolve(l);
						return true;
					}
				});
			});

		// 許可されていない場所にある外部アセットの読み込みをコンテンツ側に要求
		activeAMFlow.sendEvent([0x20, 0, ":akashic", { type: "load_external_asset", url: extContentUrlV1 }]);

		const event = await handleEvent();
		expect(event).toBe("failed_load_external_asset");
		runner.stop();
	});

	it("Akashic V3 コンテンツで allowedUrls に指定していない外部アセットは読み込めないことを確認", async () => {
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			contentUrl: contentUrlV3
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active",
			allowedUrls: [assetBaseUrlV3],
			trusted: true
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV3;
		await runnerManager.startRunner(runner.runnerId);

		const handleEvent = (): Promise<any> =>
			new Promise<any>((resolve, _reject) => {
				// コンテンツ側での g.Game#external.send() を捕捉できる
				runner.sendToExternalTrigger.add((l) => {
					if (l === "failed_load_external_asset") {
						resolve(l);
						return true;
					}
				});
			});

		// 許可されていない場所にある外部アセットの読み込みをコンテンツ側に要求
		activeAMFlow.sendEvent([0x20, 0, ":akashic", { type: "load_external_asset", url: extContentUrlV1 }]);

		const event = await handleEvent();
		expect(event).toBe("failed_load_external_asset");
		runner.stop();
	});
});
