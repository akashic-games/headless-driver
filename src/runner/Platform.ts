import { AMFlow } from "@akashic/amflow";
import { RunnerRenderingMode } from "./types";

export interface PlatformParameters {
	assetBaseUrl: string;
	configurationBaseUrl?: string;
	amflow: AMFlow;
	sendToExternalHandler: (data: any) => void;
	trusted?: boolean;
	renderingMode?: RunnerRenderingMode;
	errorHandler: (err: any) => void;
	loadFileHandler: (url: string, callback: (err: Error | null, data?: string) => void) => void;
}

export abstract class Platform {
	amflow: AMFlow;
	assetBaseUrl: string;
	configurationBaseUrl: string | undefined;
	trusted: boolean;
	renderingMode: RunnerRenderingMode;

	protected sendToExternalHandler: (data: any) => void;
	protected errorHandler: (err: any) => void;
	protected loadFileHandler: (url: string, callback: (err: Error | null, data?: string) => void) => void;

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

	sendToExternal(_playId: string, data: any): void {
		this.sendToExternalHandler(data);
	}

	// eslint-disable-next-line @typescript-eslint/typedef
	loadGameConfiguration = (url: string, callback: (err: Error | null, data?: string) => void): void => {
		this.loadFileHandler(url, (err, str) => {
			if (err) {
				callback(err);
			} else if (!str) {
				callback(new Error("Platform#loadGameConfiguration(): No data received"));
			} else {
				callback(null, JSON.parse(str));
			}
		});
	};
}
