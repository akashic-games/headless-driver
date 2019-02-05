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

	constructor(params: RunnerParameters) {
		this.params = params;
	}

	abstract start(): any;
	abstract stop(): void;

	protected onError(error: Error): void {
		this.stop();
		this.errorTrigger.fire(error);
	}
}
