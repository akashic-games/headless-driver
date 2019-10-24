import { AMFlow } from "@akashic/amflow";
import { loadFileInVm } from "./utils";

export interface PlatformParameters {
	assetBaseUrl: string;
	configurationBaseUrl?: string;
	amflow: AMFlow;
	sendToExternalHandler: (data: any) => void;
	errorHandler: (err: any) => void;
}

export abstract class Platform {
	amflow: AMFlow;
	assetBaseUrl: string;
	configurationBaseUrl: string;

	protected sendToExternalHandler: (data: any) => void;
	protected errorHandler: (err: any) => void;

	constructor(param: PlatformParameters) {
		this.assetBaseUrl = param.assetBaseUrl;
		this.configurationBaseUrl = param.configurationBaseUrl;
		this.amflow = param.amflow;
		this.sendToExternalHandler = param.sendToExternalHandler;
		this.errorHandler = param.errorHandler;
	}

	sendToExternal(playId: string, data: any): void {
		this.sendToExternalHandler(data);
	}

	loadGameConfiguration(url: string, callback: (err: Error, data?: object) => void): void {
		loadFileInVm<any>(url, { json: true })
			.then(json => callback(null, json))
			.catch(e => callback(e));
	}
}
