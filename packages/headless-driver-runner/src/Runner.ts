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
	external?: { [key: string]: string };
	gameArgs?: any;
	player?: RunnerPlayer;
	externalValue?: { [key: string]: any };
}

export type RunnerExecutionMode = "active" | "passive";

export interface RunnerPlayer {
	id: string;
	name: string;
}

export abstract class Runner {
	engineVersion: string;
	errorTrigger: Trigger<any> = new Trigger();
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

	get external(): { [key: string]: string } | undefined {
		return this.params.external;
	}

	get externalValue(): { [key: string]: any } {
		return this.params.externalValue;
	}

	constructor(params: RunnerParameters) {
		this.params = params;
	}

	/**
	 * Runner を開始する。
	 */
	abstract start(): any;
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
	abstract advance(ms: number): void;
	/**
	 * Runner を一フレーム進行する。
	 */
	abstract step(): void;

	protected onError(error: Error): void {
		this.stop();
		this.errorTrigger.fire(error);
	}
}
