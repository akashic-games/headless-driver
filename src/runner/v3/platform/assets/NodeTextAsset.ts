import type { RunnerLoadFileHandler } from "../../../types";
import type { akashicEngine as g } from "../../engineFiles";
import { Asset } from "./Asset";

export interface NodeTextAssetParameters {
	id: string;
	path: string;
	loadFileHandler: RunnerLoadFileHandler;
}

export class NodeTextAsset extends Asset implements g.TextAsset {
	type: "text" = "text";
	data: string = "";
	private loadFileHandler: RunnerLoadFileHandler;

	constructor(param: NodeTextAssetParameters) {
		super(param.id, param.path);
		this.loadFileHandler = param.loadFileHandler;
	}

	_load(loader: g.AssetLoadHandler): void {
		this.loadFileHandler(this.path, "utf-8", (err, text) => {
			if (err) {
				loader._onAssetError(this, {
					name: "AssetLoadError",
					message: err.message,
					retriable: false
				});
			} else if (text == null) {
				loader._onAssetError(this, {
					name: "AssetLoadError",
					message: "NodeTextAsset#_load(): No data received",
					retriable: false
				});
			} else {
				// FIXME: as の回避
				this.data = text as string;
				loader._onAssetLoad(this);
			}
		});
	}
}
