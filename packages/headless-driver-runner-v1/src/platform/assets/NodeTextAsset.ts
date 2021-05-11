import { akashicEngine as g } from "@akashic/engine-files";

export interface NodeTextAssetParameters {
	id: string;
	path: string;
	loadFileHandler: (url: string, callback: (err: Error | null, data?: string) => void) => void;
}

export class NodeTextAsset extends g.TextAsset {
	private loadFileHandler: (url: string, callback: (err: Error | null, data?: string) => void) => void;

	constructor(param: NodeTextAssetParameters) {
		super(param.id, param.path);
		this.loadFileHandler = param.loadFileHandler;
	}

	_load(loader: g.AssetLoadHandler): void {
		this.loadFileHandler(this.path, (err, text) => {
			// NOTE: v2 のため型については精査しない
			if (err) {
				loader._onAssetError(this, err as any);
			} else {
				this.data = text!;
				loader._onAssetLoad(this);
			}
		});
	}
}
