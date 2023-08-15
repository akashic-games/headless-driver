import { createContext, runInContext } from "vm";
import type { RunnerLoadFileHandler } from "../../../types";
import type { akashicEngine as g } from "../../engineFiles";
import { Asset } from "./Asset";

export interface NodeScriptAssetParameters {
	id: string;
	path: string;
	exports?: string[];
	errorHandler: (err: any) => void;
	loadFileHandler: RunnerLoadFileHandler;
}

export class NodeScriptAsset extends Asset implements g.ScriptAsset {
	type: "script" = "script";
	script: string = "";
	exports: string[];
	private errorHandler: (err: any) => void;
	private loadFileHandler: RunnerLoadFileHandler;

	constructor(param: NodeScriptAssetParameters) {
		super(param.id, param.path);
		this.exports = param.exports ?? [];
		this.errorHandler = param.errorHandler;
		this.loadFileHandler = param.loadFileHandler;
	}

	_load(loader: g.AssetLoadHandler): void {
		this.loadFileHandler(this.path, "utf-8", (err, text) => {
			if (err) {
				loader._onAssetError(this, {
					name: "AssetLoadError",
					message: err.message,
					retriable: false
				});
			} else if (text == null) {
				loader._onAssetError(this, {
					name: "AssetLoadError",
					message: "NoteScriptAsset#_load(): No data received",
					retriable: false
				});
			} else {
				// FIXME: as の回避
				this.script = text as string;
				loader._onAssetLoad(this);
			}
		});
	}

	execute(execEnv: g.ScriptAssetRuntimeValue): any {
		let postScript: string = "";
		for (const key of this.exports) {
			postScript += `exports["${key}"] = typeof ${key} !== "undefined" ? ${key} : undefined;\n`;
		}
		try {
			const context = createContext(Object.create(null));

			runInContext(
				`
					(console, g) => {
						globalThis.console = {
							log: console.log,
							info: console.info,
							warn: console.warn,
							error: console.error,
							assert: console.assert,
							clear: console.clear,
							dir: console.dir,
							time: console.time,
							timeEnd: console.timeEnd,
							trace: console.trace
						};
						globalThis.g = g;
					}
				`,
				context
			)(console, execEnv);

			runInContext(
				`
					(function(exports, require, module, __filename, __dirname) {
					${this.script}
					${postScript}
					})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
				`,
				context,
				{
					filename: `${this.path}`
				}
			);
		} catch (e) {
			this.errorHandler(e);
		}
		return execEnv.module.exports;
	}
}
