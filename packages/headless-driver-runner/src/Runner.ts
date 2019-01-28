import { AMFlow } from "@akashic/amflow";
import { Trigger } from "@akashic/trigger";

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
	gameArgs?: any;
	player?: RunnerPlayer;
}

export type RunnerExecutionMode = "active" | "passive";

export interface RunnerPlayer {
	id: string;
	name: string;
}

/**
 * ログレベル。
 *
 * - Error: サーバ側でも収集される、ゲーム続行不可能なクリティカルなエラーログ
 * - Warn: サーバ側でも収集される、ゲーム続行可能だが危険な状態であることを示す警告ログ
 * - Info: クライアントでのみ収集される情報ログ
 * - Debug: サンドボックス環境でのみ収集される開発時限定のログ。リリース時には本処理をすべて消してリリースすることが望ましい
 */
export type RunnerLogLevel = "error" | "warn" | "info" | "debug";

/**
 * ログ出力情報。
 */
export interface RunnerLog {
	/**
	 * ログレベル。
	 */
	level: RunnerLogLevel;
	/**
	 * ログ内容。
	 */
	message: string;
	/**
	 * ゲーム開発者が任意に利用できる、汎用のログ補助情報。
	 */
	cause?: any;
}

export abstract class Runner {
	engineVersion: string;
	errorTrigger: Trigger<any> = new Trigger();
	logTrigger: Trigger<RunnerLog> = new Trigger();

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

	get configurationBaseUrl(): string {
		return this.params.configurationBaseUrl;
	}

	get amflow(): AMFlow {
		return this.params.amflow;
	}

	get executionMode(): RunnerExecutionMode {
		return this.params.executionMode;
	}

	get gameArgs(): any {
		return this.params.gameArgs;
	}

	get player(): RunnerPlayer | undefined {
		return this.params.player;
	}

	constructor(params: RunnerParameters) {
		this.params = params;
	}

	abstract start(): any;
	abstract stop(): void;

	protected onError(error: Error): void {
		this.stop();
		this.errorTrigger.fire(error);
	}

	protected onLogging(log: RunnerLog): void {
		this.logTrigger.fire(log);
	}
}
