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
				const arrayBuffer = toArrayBuffer(data as Uint8Array);
				this.data = arrayBuffer;
				loader._onAssetLoad(this);
			}
		});
	}
}

function toArrayBuffer(typedArray: Uint8Array): ArrayBuffer {
	const arrayBuffer = new ArrayBuffer(typedArray.length);
	const view = new Uint8Array(arrayBuffer);
	for (let i = 0; i < typedArray.length; ++i) {
		view[i] = typedArray[i];
	}
	return arrayBuffer;
}
