import * as path from "path";
import { getSystemLogger } from "../Logger";
import type { AMFlowClient } from "../play/amflow/AMFlowClient";
import type { PlayManager } from "../play/PlayManager";
import type { EncodingType } from "../utils";
import { loadFile, resolveUrl } from "../utils";
import type { RunnerParameters, RunnerStartParameters } from "./Runner";
import type { RunnerExecutionMode, RunnerLoopMode, RunnerPlayer, RunnerRenderingMode } from "./types";
import type { RunnerV1Game } from "./v1";
import { RunnerV1 } from "./v1";
import type { RunnerV2Game } from "./v2";
import { RunnerV2 } from "./v2";
import type { RunnerV3Game } from "./v3";
import { RunnerV3 } from "./v3";

export interface CreateRunnerParameters {
	playId: string;
	amflow: AMFlowClient;
	playToken: string;
	executionMode: RunnerExecutionMode;
	loopMode?: RunnerLoopMode;
	gameArgs?: any;
	player?: RunnerPlayer;
	/**
	 * 信頼されたコンテンツであるかどうか。
	 * この設定は現在のバージョンにおいて形骸化している。本値により振る舞いは変化しない。
	 * 初期値は `false` 。
	 */
	trusted?: boolean;
	/**
	 * レンダリングモード。
	 * `"canvas"` または `"@napi-rs/canvas"` を指定するとプライマリサーフェスの描画内容を `Runner#getPrimarySurface()` を経由して取得できる。
	 * `"canvas"` を指定した場合、利用側で node-canvas をインストールしなければならない。
	 * `"@napi-rs/canvas"` を指定した場合、利用側で @napi-rs/canvas をインストールしなければならない。
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
					const _url = resolveUrl(engineConfiguration.asset_base_url, gameConfiguration.definitions[i]);
					const _def: GameConfiguration = await this.loadJSON(_url);
					defs.push(_def);
				}
				version = defs.reduce((acc: SandboxRuntimeVersion, def) => {
					return (def.environment && def.environment["sandbox-runtime"]) ?? acc;
				}, version);
				configurationBaseUrl = resolveUrl(engineConfiguration.content_url, "./");
			} else if (gameConfiguration.environment && gameConfiguration.environment["sandbox-runtime"]) {
				version = gameConfiguration.environment["sandbox-runtime"];
			}

			const runnerId = `${this.nextRunnerId++}`;

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
				loopMode: params.loopMode,
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
				runner = new RunnerV3(runnerParameter);
			} else if (version === "2") {
				getSystemLogger().info("v2 content");
				runner = new RunnerV2(runnerParameter);
			} else {
				getSystemLogger().info("v1 content");
				runner = new RunnerV1(runnerParameter);
			}

			runner.errorTrigger.add((err) => {
				getSystemLogger().error(err);
				void this.stopRunner(runnerId);
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
	async startRunner(runnerId: string, options?: RunnerStartParameters): Promise<RunnerV1Game | RunnerV2Game | RunnerV3Game | null> {
		const runner = this.getRunner(runnerId);

		if (!runner) {
			throw new Error("Runner is not found");
		}

		return runner.start(options);
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
		return loadFile(contentUrl, "utf-8").then((text) => JSON.parse(text));
	}

	protected createLoadFileHandler(allowedUrls: (string | RegExp)[] | null) {
		return (url: string, encoding: EncodingType, callback: (err: Error | null, data?: string | Uint8Array) => void): void => {
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
			loadFile(url, encoding)
				.then((text) => {
					callback(null, text);
				})
				.catch((e) => {
					callback(e);
				});
		};
	}
}
