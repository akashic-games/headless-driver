import { RunnerExecutionMode, RunnerPlayer } from "@akashic/headless-driver-runner";
import { RunnerV1, RunnerV1Game } from "@akashic/headless-driver-runner-v1";
import { RunnerV2, RunnerV2Game } from "@akashic/headless-driver-runner-v2";
import fetch from "node-fetch";
import * as url from "url";
import { getSystemLogger } from "../Logger";
import { AMFlowClient } from "../play/amflow/AMFlowClient";
import { PlayManager } from "../play/PlayManager";

export interface CreateRunnerParameters {
	playId: string;
	amflow: AMFlowClient;
	playToken: string;
	executionMode: RunnerExecutionMode;
	gameArgs?: any;
	player?: RunnerPlayer;
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
		"sandbox-runtime"?: "1" | "2";
	};
}

/**
 * Runner を管理するマネージャ。
 */
export class RunnerManager {
	private runners: (RunnerV1 | RunnerV2)[] = [];
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
		let runner: RunnerV1 | RunnerV2;

		const play = this.playManager.getPlay(params.playId);
		if (play == null) {
			throw new Error("Play is not found");
		}

		try {
			const contentUrl = play.contentUrl;
			const amflow = params.amflow;

			const engineConfiguration = await this.fetchContentUrl(play.contentUrl);
			const gameConfiguration = await this.loadJson<GameConfiguration>(engineConfiguration.content_url);
			let configurationBaseUrl: string | null = null;
			let version: "1" | "2" = "1";

			// NOTE: `sandbox-runtime` の値を解決する。
			// TODO: akashic-runtime の値を参照するようにする。
			if (gameConfiguration.definitions) {
				const defs: GameConfiguration[] = [];
				for (let i = 0; i < gameConfiguration.definitions.length; i++) {
					const _url = url.resolve(engineConfiguration.asset_base_url, gameConfiguration.definitions[i]);
					const _def = await this.loadJson<any>(_url);
					defs.push(_def);
				}
				version = defs.reduce((acc, def) => (def.environment && def.environment["sandbox-runtime"]) || acc, version);
				configurationBaseUrl = url.resolve(engineConfiguration.content_url, "./");
			} else if (gameConfiguration.environment && gameConfiguration.environment["sandbox-runtime"] === "2") {
				version = "2";
			}

			const runnerId = `${this.nextRunnerId++}`;

			if (version === "2") {
				getSystemLogger().info("v2 content");
				runner = new RunnerV2({
					contentUrl,
					assetBaseUrl: engineConfiguration.asset_base_url,
					configurationUrl: engineConfiguration.content_url,
					configurationBaseUrl,
					runnerId,
					playId: play.playId,
					playToken: params.playToken,
					amflow,
					executionMode: params.executionMode,
					gameArgs: params.gameArgs,
					player: params.player
				});
				runner.errorTrigger.addOnce((err: any) => {
					getSystemLogger().error(err);
					this.stopRunner(runnerId);
				});
			} else {
				getSystemLogger().info("v1 content");
				runner = new RunnerV1({
					contentUrl,
					assetBaseUrl: engineConfiguration.asset_base_url,
					configurationUrl: engineConfiguration.content_url,
					configurationBaseUrl,
					runnerId,
					playId: play.playId,
					playToken: params.playToken,
					amflow,
					executionMode: params.executionMode,
					gameArgs: params.gameArgs,
					player: params.player
				});
				runner.errorTrigger.handle((err: any) => {
					getSystemLogger().error(err);
					this.stopRunner(runnerId);
					return true;
				});
			}

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
	async startRunner(runnerId: string): Promise<RunnerV1Game | RunnerV2Game | null> {
		const runner = this.getRunner(runnerId);

		if (!runner) {
			throw new Error("Runner is not found");
		}

		return await runner.start();
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
		this.runners = this.runners.filter(r => r !== runner);
	}

	/**
	 * Runner の情報を取得する。
	 * @param runnerId RunnerID
	 */
	getRunner(runnerId: string): (RunnerV1 | RunnerV2) | null {
		return this.runners.find(runner => runner.runnerId === runnerId);
	}

	/**
	 * 現在作成されている Runner の情報の一覧を取得する。
	 */
	getRunners(): (RunnerV1 | RunnerV2)[] {
		return this.runners;
	}

	protected fetchContentUrl(contentUrl: string): Promise<EngineConfiguration> {
		return new Promise<EngineConfiguration>((resolve, reject) => {
			fetch(contentUrl, { method: "GET" })
				.then(res => res.json())
				.then((config: EngineConfiguration) => resolve(config))
				.catch(e => reject(e));
		});
	}

	protected loadJson<T>(jsonUrl: string): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			fetch(jsonUrl, { method: "GET" })
				.then(res => resolve(res.json()))
				.catch(e => reject(e));
		});
	}
}
