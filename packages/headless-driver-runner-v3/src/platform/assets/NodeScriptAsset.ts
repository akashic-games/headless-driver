import { akashicEngine as g } from "../../engineFiles";
import { Asset } from "./Asset";

export interface NodeScriptAssetParameters {
	id: string;
	path: string;
	errorHandler: (err: any) => void;
	loadFileHandler: (url: string, callback: (err: Error | null, data?: string) => void) => void;
}

export class NodeScriptAsset extends Asset implements g.ScriptAsset {
	static PRE_SCRIPT: string = "(function(exports, require, module, __filename, __dirname) {\n";
	static POST_SCRIPT: string = "\n})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);";

	type: "script" = "script";
	script: string = "";
	private errorHandler: (err: any) => void;
	private loadFileHandler: (url: string, callback: (err: Error | null, data?: string) => void) => void;

	constructor(param: NodeScriptAssetParameters) {
		super(param.id, param.path);
		this.errorHandler = param.errorHandler;
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
				this.script = text;
				loader._onAssetLoad(this);
			}
		});
	}

	execute(execEnv: g.ScriptAssetRuntimeValue): any {
		const func = new Function("g", NodeScriptAsset.PRE_SCRIPT + this.script + NodeScriptAsset.POST_SCRIPT);
		try {
			func(execEnv);
		} catch (e) {
			this.errorHandler(e);
		}
		return execEnv.module.exports;
	}
}
