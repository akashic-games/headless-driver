import type { AMFlow } from "@akashic/amflow";
import type { RunnerLoadFileHandler, RunnerRenderingMode } from "./types";

export interface PlatformParameters {
	assetBaseUrl: string;
	configurationBaseUrl?: string;
	amflow: AMFlow;
	sendToExternalHandler: (data: any) => void;
	trusted?: boolean;
	renderingMode?: RunnerRenderingMode;
	errorHandler: (err: any) => void;
	loadFileHandler: RunnerLoadFileHandler;
}

export abstract class Platform {
	amflow: AMFlow;
	assetBaseUrl: string;
	configurationBaseUrl: string | undefined;
	trusted: boolean;
	renderingMode: RunnerRenderingMode;

	protected sendToExternalHandler: (data: any) => void;
	protected errorHandler: (err: any) => void;
	protected loadFileHandler: RunnerLoadFileHandler;

	constructor(param: PlatformParameters) {
		this.assetBaseUrl = param.assetBaseUrl;
		this.configurationBaseUrl = param.configurationBaseUrl;
		this.amflow = param.amflow;
		this.trusted = !!param.trusted;
		this.renderingMode = param.renderingMode ?? "none";
		this.sendToExternalHandler = param.sendToExternalHandler;
		this.errorHandler = param.errorHandler;
		this.loadFileHandler = param.loadFileHandler;
	}

	abstract advanceLoopers(ms: number): void;

	sendToExternal(_playId: string, data: any): void {
		this.sendToExternalHandler(data);
	}

	// eslint-disable-next-line @typescript-eslint/typedef
	loadGameConfiguration = (url: string, callback: (err: Error | null, data?: string | Uint8Array) => void): void => {
		this.loadFileHandler(url, "utf-8", (err, str) => {
			if (err) {
				callback(err);
			} else if (!str) {
				callback(new Error("Platform#loadGameConfiguration(): No data received"));
			} else {
				// FIXME: as の回避
				callback(null, JSON.parse(str as string));
			}
		});
	};
}
