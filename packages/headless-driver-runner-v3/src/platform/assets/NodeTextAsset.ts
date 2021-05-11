import { akashicEngine as g } from "../../engineFiles";
import { Asset } from "./Asset";

export interface NodeTextAssetParameters {
	id: string;
	path: string;
	loadFileHandler: (url: string, callback: (err: Error | null, data?: string) => void) => void;
}

export class NodeTextAsset extends Asset implements g.TextAsset {
	type: "text" = "text";
	data: string = "";
	private loadFileHandler: (url: string, callback: (err: Error | null, data?: string) => void) => void;

	constructor(param: NodeTextAssetParameters) {
		super(param.id, param.path);
		this.loadFileHandler = param.loadFileHandler;
	}

	_load(loader: g.AssetLoadHandler): void {
		this.loadFileHandler(this.path, (err, text) => {
			if (err) {
				loader._onAssetError(this, {
					name: "AssetLoadError",
					message: err.message,
					retriable: false
				});
			} else if (!text) {
				loader._onAssetError(this, {
					name: "AssetLoadError",
					message: "NoteScriptAsset#_load(): no text data loaded",
					retriable: false
				});
			} else {
				this.data = text;
				loader._onAssetLoad(this);
			}
		});
	}
}
