import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import { RunnerExecutionMode, RunnerParameters, RunnerPlayer, RunnerRenderingMode } from "@akashic/headless-driver-runner";
import { RunnerV1, RunnerV1Game } from "@akashic/headless-driver-runner-v1";
import { RunnerV2, RunnerV2Game } from "@akashic/headless-driver-runner-v2";
import { RunnerV3, RunnerV3Game } from "@akashic/headless-driver-runner-v3";
import { requireEngineFiles } from "@akashic/headless-driver-runner-v3/lib/requireEngineFiles";
import { NodeVM, VMScript } from "vm2";
import * as ExecVmScriptV1 from "../ExecuteVmScriptV1";
import * as ExecVmScriptV2 from "../ExecuteVmScriptV2";
import * as ExecVmScriptV3 from "../ExecuteVmScriptV3";
import { getSystemLogger } from "../Logger";
import { AMFlowClient } from "../play/amflow/AMFlowClient";
import { PlayManager } from "../play/PlayManager";
import { loadFile } from "../utils";

export interface CreateRunnerParameters {
	playId: string;
	amflow: AMFlowClient;
	playToken: string;
	executionMode: RunnerExecutionMode;
	gameArgs?: any;
	player?: RunnerPlayer;
	/**
	 * 信頼されたコンテンツであるかどうか。
	 * `true` の場合、そのコンテンツを「信頼されたもの」として扱い、外部モジュールまたは組み込みモジュールへのアクセスが許可される。
	 * `false` の場合、コンテンツまたはエンジンモジュールでの動作が一部制限される (外部モジュールまたは組み込みモジュールへのアクセスが制限など)。
	 * 特に理由がない限り `false` にしておくことを推奨。
	 * 初期値は `false` 。
	 */
	trusted?: boolean;
	/**
	 * レンダリングモード。
	 * `"canvas"` を指定するとプライマリサーフェスの描画内容を `Runner#getPrimarySurface()` を経由して取得できる。
	 * `"canvas"` を指定した場合 `trusted` を `true` にしなければならない。また、利用側で node-canvas をインストールしなければならない。
	 * 初期値は `"none"` 。
	 */
	renderingMode?: RunnerRenderingMode;
	/**
	 * 外部アセットとして許可する URL。
	 * この URL と先頭一致しない外部アセットへのアクセスはエラーとなる。
	 * null が指定された場合は全ての外部アセットへのアクセスを許可する。
	 */
	allowedUrls: (string | RegExp)[] | null;
	/**
	 * g.Game#external に与えられる値。
	 * g.Game#_started の発火前にセットされる。
	 */
	externalValue?: { [key: string]: any };
}

interface EngineConfiguration {
	content_url: string;
	asset_base_url: string;
	engine_urls: string[];
	external: string[];
}

interface GameConfiguration {
	definitions?: string[];
	environment?: {
		"sandbox-runtime"?: "1" | "2" | "3";
		external: { [key: string]: string };
	};
}

type SandboxRuntimeVersion = "1" | "2" | "3";

/**
 * Runner を管理するマネージャ。
 */
export class RunnerManager {
	private runners: (RunnerV1 | RunnerV2 | RunnerV3)[] = [];
	private nextRunnerId: number = 0;
	private playManager: PlayManager;

	constructor(playManager: PlayManager) {
		this.playManager = playManager;
	}

	/**
	 * Runner を作成する。
	 * Runner は Node.js の Virtual Machine 上で実行される。
	 * 主な制限事項として process へのアクセスが制限される。
	 * @param params パラメータ
	 */
	async createRunner(params: CreateRunnerParameters): Promise<string> {
		if (params.allowedUrls != null) {
			params.allowedUrls.forEach((u) => {
				// 正規表現の場合、'^' で始まらなければエラーとする。
				if (u instanceof RegExp && !/^\/\^/.test(u.toString())) {
					throw new Error(`Regexp must start with '^'. value:${u}`);
				}
			});
		}

		let runner: RunnerV1 | RunnerV2 | RunnerV3;

		const play = this.playManager.getPlay(params.playId);
		if (play == null) {
			throw new Error("Play is not found");
		}

		try {
			let engineConfiguration: EngineConfiguration;
			let gameConfiguration: GameConfiguration;
			let contentUrl: string;
			let external: { [name: string]: string } = {};

			if ("contentUrl" in play) {
				contentUrl = play.contentUrl;
				engineConfiguration = await this.resolveContent(contentUrl);
				gameConfiguration = await this.resolveGameConfiguration(engineConfiguration.content_url);
				for (let i = 0; i < engineConfiguration.external.length; i++) {
					const name = engineConfiguration.external[i];
					external[name] = "0"; // NOTE: "0" 扱いとする
				}
			} else {
				contentUrl = play.gameJsonPath;
				gameConfiguration = await this.resolveGameConfiguration(contentUrl);
				let ext: string[] = [];
				if (gameConfiguration.environment != null && gameConfiguration.environment.external != null) {
					external = gameConfiguration.environment.external;
					ext = Object.keys(gameConfiguration.environment.external);
				}
				engineConfiguration = {
					external: ext,
					content_url: contentUrl,
					asset_base_url: path.dirname(play.gameJsonPath),
					engine_urls: []
				};
			}
			const amflow = params.amflow;

			let configurationBaseUrl: string | undefined;
			let version: SandboxRuntimeVersion = "1";

			// NOTE: `sandbox-runtime` の値を解決する。
			// TODO: akashic-runtime の値を参照するようにする。
			if (gameConfiguration.definitions) {
				const defs: GameConfiguration[] = [];
				for (let i = 0; i < gameConfiguration.definitions.length; i++) {
					const _url = url.resolve(engineConfiguration.asset_base_url, gameConfiguration.definitions[i]);
					const _def: GameConfiguration = await this.loadJSON(_url);
					defs.push(_def);
				}
				version = defs.reduce((acc: SandboxRuntimeVersion, def) => {
					return (def.environment && def.environment["sandbox-runtime"]) || acc;
				}, version);
				configurationBaseUrl = url.resolve(engineConfiguration.content_url, "./");
			} else if (gameConfiguration.environment && gameConfiguration.environment["sandbox-runtime"]) {
				version = gameConfiguration.environment["sandbox-runtime"];
			}

			const runnerId = `${this.nextRunnerId++}`;
			const nvm = this.createVm(params.trusted);

			const runnerParameter: RunnerParameters = {
				contentUrl,
				assetBaseUrl: engineConfiguration.asset_base_url,
				configurationUrl: engineConfiguration.content_url,
				configurationBaseUrl,
				runnerId,
				playId: play.playId,
				playToken: params.playToken,
				amflow,
				executionMode: params.executionMode,
				trusted: params.trusted,
				renderingMode: params.renderingMode,
				loadFileHandler: this.createLoadFileHandler(params.allowedUrls),
				external,
				gameArgs: params.gameArgs,
				player: params.player,
				externalValue: params.externalValue
			};

			if (version === "3") {
				getSystemLogger().info("v3 content");
				const filePath = ExecVmScriptV3.getFilePath();
				const str = fs.readFileSync(filePath, { encoding: "utf8" });
				const script = new VMScript(str, filePath);
				runner = (nvm.run(script) as typeof ExecVmScriptV3).createRunnerV3(runnerParameter);
			} else if (version === "2") {
				getSystemLogger().info("v2 content");
				const filePath = ExecVmScriptV2.getFilePath();
				const str = fs.readFileSync(filePath, { encoding: "utf8" });
				const script = new VMScript(str, filePath);
				runner = (nvm.run(script) as typeof ExecVmScriptV2).createRunnerV2(runnerParameter);
			} else {
				getSystemLogger().info("v1 content");
				const filePath = ExecVmScriptV1.getFilePath();
				const str = fs.readFileSync(filePath, { encoding: "utf8" });
				const script = new VMScript(str, filePath);
				runner = (nvm.run(script) as typeof ExecVmScriptV1).createRunnerV1(runnerParameter);
			}

			runner.errorTrigger.add((err: any) => {
				getSystemLogger().error(err);
				this.stopRunner(runnerId);
				return true;
			});

			this.runners.push(runner);
		} catch (e) {
			throw e;
		}

		return runner.runnerId;
	}

	/**
	 * Runner を開始する。
	 * @param runnerId RunnerID
	 */
	async startRunner(runnerId: string): Promise<RunnerV1Game | RunnerV2Game | RunnerV3Game | null> {
		const runner = this.getRunner(runnerId);

		if (!runner) {
			throw new Error("Runner is not found");
		}

		return runner.start();
	}

	/**
	 * Runner を停止する。
	 * @param runnerId RunnerID
	 */
	async stopRunner(runnerId: string): Promise<void> {
		const runner = this.getRunner(runnerId);

		if (!runner) {
			throw new Error("Runner is not found");
		}

		await runner.stop();
		this.runners = this.runners.filter((r) => r !== runner);
	}

	/**
	 * Runner を一時停止する
	 * @param runnerId RunnerID
	 */
	async pauseRunner(runnerId: string): Promise<void> {
		const runner = this.getRunner(runnerId);

		if (!runner) {
			throw new Error("Runner is not found");
		}

		await runner.pause();
	}

	/**
	 * Runner の一時停止を解除する
	 * @param runnerId RunnerID
	 */
	async resumeRunner(runnerId: string): Promise<void> {
		const runner = this.getRunner(runnerId);

		if (!runner) {
			throw new Error("Runner is not found");
		}

		await runner.resume();
	}

	/**
	 * 一時停止中の Runner を一フレーム進める
	 * @param runnerId RunnerID
	 */
	async stepRunner(runnerId: string): Promise<void> {
		const runner = this.getRunner(runnerId);

		if (!runner) {
			throw new Error("Runner is not found");
		}

		await runner.step();
	}

	/**
	 * 一時停止中の Runner を指定のミリ秒だけ進める
	 * @param runnerId RunnerID
	 */
	async advanceRunner(runnerId: string, ms: number): Promise<void> {
		const runner = this.getRunner(runnerId);

		if (!runner) {
			throw new Error("Runner is not found");
		}

		await runner.advance(ms);
	}

	/**
	 * Runner の情報を取得する。
	 * @param runnerId RunnerID
	 */
	getRunner(runnerId: string): (RunnerV1 | RunnerV2 | RunnerV3) | null {
		return this.runners.find((runner) => runner.runnerId === runnerId) || null;
	}

	/**
	 * 現在作成されている Runner の情報の一覧を取得する。
	 */
	getRunners(): (RunnerV1 | RunnerV2 | RunnerV3)[] {
		return this.runners;
	}

	protected async resolveContent(contentUrl: string): Promise<EngineConfiguration> {
		return this.loadJSON<EngineConfiguration>(contentUrl);
	}

	protected async resolveGameConfiguration(gameJsonUrl: string): Promise<GameConfiguration> {
		return this.loadJSON<GameConfiguration>(gameJsonUrl);
	}

	protected async loadJSON<T>(contentUrl: string): Promise<T> {
		return loadFile(contentUrl).then((text) => JSON.parse(text));
	}

	protected createLoadFileHandler(allowedUrls: (string | RegExp)[] | null) {
		return (url: string, callback: (err: Error | null, data?: string) => void): void => {
			if (allowedUrls != null) {
				const isAllowedUrl = allowedUrls.some((u) => {
					if (typeof u === "string") {
						return url.startsWith(u);
					} else if (u instanceof RegExp) {
						return u.test(url);
					}
					return false;
				});
				if (!isAllowedUrl) {
					return void callback(new Error(`Not allowed to read this URL. ${url}`));
				}
			}
			loadFile(url)
				.then((text) => {
					callback(null, text);
				})
				.catch((e) => {
					callback(e);
				});
		};
	}

	protected createVm(trusted: boolean = false): NodeVM {
		return new NodeVM({
			sandbox: {
				trustedFunctions: {
					engineFiles: (): any | undefined => {
						return requireEngineFiles();
					}
				}
			},
			require: trusted
				? {
						context: "host",
						external: true,
						builtin: ["*"]
				  }
				: {
						context: "sandbox",
						external: true,
						builtin: []
				  }
		});
	}
}
