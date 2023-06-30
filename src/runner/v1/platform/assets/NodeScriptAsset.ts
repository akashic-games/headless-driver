import { akashicEngine as g } from "engine-files-v1";
import type { RunnerLoadFileHandler } from "../../../types";

export interface NodeScriptAssetParameters {
	id: string;
	path: string;
	errorHandler: (err: any) => void;
	loadFileHandler: RunnerLoadFileHandler;
}

export class NodeScriptAsset extends g.ScriptAsset {
	static PRE_SCRIPT: string = "(function(exports, require, module, __filename, __dirname) {\n";
	static POST_SCRIPT: string = "\n})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);";
	private errorHandler: (err: any) => void;
	private loadFileHandler: RunnerLoadFileHandler;

	constructor(param: NodeScriptAssetParameters) {
		super(param.id, param.path);
		this.errorHandler = param.errorHandler;
		this.loadFileHandler = param.loadFileHandler;
	}

	_load(loader: g.AssetLoadHandler): void {
		this.loadFileHandler(this.path, "utf-8", (err, text) => {
			// NOTE: 過去バージョンのため型については精査しない
			if (err) {
				loader._onAssetError(this, err as any);
			} else {
				this.script = text as string;
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
