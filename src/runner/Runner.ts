import type { AMFlow } from "@akashic/amflow";
import { Trigger } from "@akashic/trigger";
import type { Platform } from "./Platform";
import type {
	RunnerAdvanceConditionFunc,
	RunnerExecutionMode,
	RunnerLoadFileHandler,
	RunnerLoopMode,
	RunnerPlayer,
	RunnerPointEvent,
	RunnerRenderingMode
} from "./types";

export interface RunnerParameters {
	contentUrl: string;
	assetBaseUrl: string;
	configurationUrl: string;
	configurationBaseUrl?: string;
	playId: string;
	playToken: string;
	runnerId: string;
	amflow: AMFlow;
	executionMode: RunnerExecutionMode;
	loopMode?: RunnerLoopMode;
	trusted?: boolean;
	renderingMode?: RunnerRenderingMode;
	loadFileHandler: RunnerLoadFileHandler;
	external?: { [key: string]: string };
	gameArgs?: any;
	player?: RunnerPlayer;
	externalValue?: { [key: string]: any };
}

export interface RunnerStartParameters {
	/**
	 * コンテンツの進行を一時停止するかどうか。
	 * 初期値は `false` 。
	 */
	paused?: boolean;
}

export abstract class Runner {
	abstract readonly engineVersion: string;

	/**
	 * g の名前空間のオブジェクト。`g.game` は `undefined` であることに注意。
	 */
	abstract readonly g: any;

	abstract platform: Platform | null;

	errorTrigger: Trigger<Error> = new Trigger();

	sendToExternalTrigger: Trigger<any> = new Trigger();

	private params: RunnerParameters;

	get runnerId(): string {
		return this.params.runnerId;
	}

	get playId(): string {
		return this.params.playId;
	}

	get playToken(): string {
		return this.params.playToken;
	}

	get contentUrl(): string {
		return this.params.contentUrl;
	}

	get assetBaseUrl(): string {
		return this.params.assetBaseUrl;
	}

	get configurationUrl(): string {
		return this.params.configurationUrl;
	}

	get configurationBaseUrl(): string | undefined {
		return this.params.configurationBaseUrl;
	}

	get amflow(): AMFlow {
		return this.params.amflow;
	}

	get executionMode(): RunnerExecutionMode {
		return this.params.executionMode;
	}

	get loopMode(): RunnerLoopMode {
		return this.params.loopMode ?? "realtime";
	}

	get trusted(): boolean {
		return !!this.params.trusted;
	}

	get renderingMode(): RunnerRenderingMode {
		return this.params.renderingMode ?? "none";
	}

	get loadFileHandler(): RunnerLoadFileHandler {
		return this.params.loadFileHandler;
	}

	get gameArgs(): any {
		return this.params.gameArgs;
	}

	get player(): RunnerPlayer | undefined {
		return this.params.player;
	}

	get external(): { [key: string]: string } | undefined {
		return this.params.external;
	}

	get externalValue(): { [key: string]: any } | undefined {
		return this.params.externalValue;
	}

	constructor(params: RunnerParameters) {
		this.params = params;
	}

	/**
	 * Runner を開始する。
	 * @param params 起動時に必要なパラメータ。
	 * @returns `g.game` のインスタンス。起動に失敗した場合は `null` 。
	 */
	abstract start(params?: RunnerStartParameters): any;
	/**
	 * Runner を停止する。
	 */
	abstract stop(): void;
	/**
	 * Runner を一時停止する。
	 */
	abstract pause(): void;
	/**
	 * Runner を再開する。
	 */
	abstract resume(): void;
	/**
	 * Runner を指定ミリ秒だけ進行する。
	 * @param ms 進行するミリ秒。
	 */
	abstract advance(ms: number): Promise<void>;
	/**
	 * Runner を一フレーム進行する。
	 */
	abstract step(): Promise<void>;
	/**
	 * Runner に対して任意のポイントイベントを発火させる。
	 * @param event 発火させるポイントイベント
	 */
	abstract firePointEvent(event: RunnerPointEvent): void;
	/**
	 * 実行中コンテンツのプライマリサーフェスを取得する。
	 * @returns プライマリサーフェスのインスタンス。
	 */
	abstract getPrimarySurface(): any;

	/**
	 * 引数に指定した関数が真を返すまでゲームの状態を進める。
	 * @param condition 進めるまでの条件となる関数。
	 * @param timeout タイムアウトまでのミリ秒数。省略時は `5000` 。ゲーム内時間ではなく実時間である点に注意。
	 */
	async advanceUntil(condition: RunnerAdvanceConditionFunc, timeout: number = 5000): Promise<void> {
		return new Promise((resolve, reject) => {
			const limit = performance.now() + timeout;
			const handler = (): void => {
				if (limit < performance.now()) {
					return void reject(new Error("Runner#advanceUntil(): processing timeout"));
				}
				try {
					if (condition()) return void resolve();
					this._stepMinimal();
				} catch (e) {
					return void reject(e);
				}
				setImmediate(handler);
			};
			handler();
		});
	}

	/**
	 * 次フレームを飛ばさない程度に時間を進める。
	 */
	protected abstract _stepMinimal(): void;

	protected onError(error: Error): void {
		this.stop();
		this.errorTrigger.fire(error);
	}
}
