import { akashicEngine as g } from "@akashic/engine-files";
import { loadFile } from "@akashic/headless-driver-runner";

export class NodeScriptAsset extends g.ScriptAsset {
	static PRE_SCRIPT: string = "(function(exports, require, module, __filename, __dirname) {\n";
	static POST_SCRIPT: string = "\n})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);";
	private errorHandler: (err: any) => void;

	constructor(id: string, path: string, errorHandler: (err: any) => void) {
		super(id, path);
		this.errorHandler = errorHandler;
	}

	_load(loader: g.AssetLoadHandler): void {
		loadFile<string>(this.path, {json: false})
			.then(text => {
				this.script = text;
				return loader._onAssetLoad(this);
			})
			.catch(e => loader._onAssetError(this, e));
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
