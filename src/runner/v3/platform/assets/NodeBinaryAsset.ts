import type { RunnerLoadFileHandler } from "../../../types";
import type { akashicEngine as g } from "../../engineFiles";
import { Asset } from "./Asset";

export interface NodeBinaryAssetParameters {
	id: string;
	path: string;
	loadFileHandler: RunnerLoadFileHandler;
}

export class NodeBinaryAsset extends Asset implements g.BinaryAsset {
	type: "binary" = "binary";
	data!: ArrayBuffer;
	private loadFileHandler: RunnerLoadFileHandler;

	constructor(param: NodeBinaryAssetParameters) {
		super(param.id, param.path);
		this.loadFileHandler = param.loadFileHandler;
	}

	_load(loader: g.AssetLoadHandler): void {
		this.loadFileHandler(this.path, "uint8array", (err, data) => {
			if (err) {
				loader._onAssetError(this, {
					name: "AssetLoadError",
					message: err.message,
					retriable: false
				});
			} else if (data == null) {
				loader._onAssetError(this, {
					name: "AssetLoadError",
					message: "NodeBinaryAsset#_load(): No data received",
					retriable: false
				});
			} else {
				// FIXME: as の回避
				this.data = (data as Uint8Array).buffer;
				loader._onAssetLoad(this);
			}
		});
	}
}
