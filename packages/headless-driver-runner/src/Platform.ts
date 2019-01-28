import fetch from "node-fetch";
import { AMFlow } from "@akashic/amflow";

export interface PlatformParameters {
	assetBaseUrl: string;
	configurationBaseUrl?: string;
	amflow: AMFlow;
	errorHandler: (err: any) => void;
}

export abstract class Platform {
	amflow: AMFlow;
	assetBaseUrl: string;
	configurationBaseUrl: string;

	protected errorHandler: (err: any) => void;

	constructor(param: PlatformParameters) {
		this.assetBaseUrl = param.assetBaseUrl;
		this.configurationBaseUrl = param.configurationBaseUrl;
		this.amflow = param.amflow;
		this.errorHandler = param.errorHandler;
	}

	sendToExternal(data: any): void {
		// TODO
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
