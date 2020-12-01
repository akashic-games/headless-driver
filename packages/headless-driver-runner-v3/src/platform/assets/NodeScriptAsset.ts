import { akashicEngine as g } from "@akashic/engine-files";
import { loadFileInSandbox } from "@akashic/headless-driver-runner";
import { Asset } from "./Asset";

export class NodeScriptAsset extends Asset implements g.ScriptAsset {
	static PRE_SCRIPT: string = "(function(exports, require, module, __filename, __dirname) {\n";
	static POST_SCRIPT: string = "\n})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);";

	type: "script" = "script";
	script!: string;
	private errorHandler: (err: any) => void;

	constructor(id: string, path: string, errorHandler: (err: any) => void) {
		super(id, path);
		this.errorHandler = errorHandler;
	}

	_load(loader: g.AssetLoadHandler): void {
		loadFileInSandbox<string>(this.path, { json: false })
			.then((text) => {
				this.script = text;
				return loader._onAssetLoad(this);
			})
			.catch((e) => {
				loader._onAssetError(this, e);
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
