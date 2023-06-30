import { akashicEngine as g } from "engine-files-v2";
import type { RunnerLoadFileHandler } from "../../../types";

export interface NodeTextAssetParameters {
	id: string;
	path: string;
	loadFileHandler: RunnerLoadFileHandler;
}

export class NodeTextAsset extends g.TextAsset {
	private loadFileHandler: RunnerLoadFileHandler;

	constructor(param: NodeTextAssetParameters) {
		super(param.id, param.path);
		this.loadFileHandler = param.loadFileHandler;
	}

	_load(loader: g.AssetLoadHandler): void {
		this.loadFileHandler(this.path, "utf-8", (err, text) => {
			// NOTE: 過去バージョンのため型については精査しない
			if (err) {
				loader._onAssetError(this, err as any);
			} else {
				this.data = text as string;
				loader._onAssetLoad(this);
			}
		});
	}
}
