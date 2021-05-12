import { akashicEngine as g } from "@akashic/engine-files";

export interface NodeScriptAssetParameters {
	id: string;
	path: string;
	loadFileHandler: (url: string, callback: (err: Error | null, data?: string) => void) => void;
	errorHandler: (err: any) => void;
}

export class NodeScriptAsset extends g.ScriptAsset {
	static PRE_SCRIPT: string = "(function(exports, require, module, __filename, __dirname) {\n";
	static POST_SCRIPT: string = "\n})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);";
	private loadFileHandler: (url: string, callback: (err: Error | null, data?: string) => void) => void;
	private errorHandler: (err: any) => void;

	constructor(param: NodeScriptAssetParameters) {
		super(param.id, param.path);
		this.loadFileHandler = param.loadFileHandler;
		this.errorHandler = param.errorHandler;
	}

	_load(loader: g.AssetLoadHandler): void {
		this.loadFileHandler(this.path, (err, text) => {
			// NOTE: 過去バージョンのため型については精査しない
			if (err) {
				loader._onAssetError(this, err as any);
			} else {
				this.script = text!;
				loader._onAssetLoad(this);
			}
		});
	}

	execute(execEnv: g.ScriptAssetExecuteEnvironment): any {
		const func = new Function("g", NodeScriptAsset.PRE_SCRIPT + this.script + NodeScriptAsset.POST_SCRIPT);
		try {
			func(execEnv);
		} catch (e) {
			this.errorHandler(e);
		}
		return execEnv.module.exports;
	}
}
