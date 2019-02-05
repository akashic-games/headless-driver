import fetch from "node-fetch";
import { AMFlow } from "@akashic/amflow";

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
		fetch(url, { method: "GET" })
			.then(res => res.json())
			.then(data => {
				callback(null, data);
			})
			.catch(e => {
				callback(e);
			});
	}
}
