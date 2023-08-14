import { createContext, Script } from "vm";
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
			const context = {
				g: execEnv,
				console
			};
			const code = `
				(function(exports, require, module, __filename, __dirname, globalThis) {
				${this.script}
				${postScript}
				})(g.module.exports, g.module.require, g.module, g.filename, g.dirname, undefined);
			`;
			const script = new Script(code, { filename: this.path });
			createContext(context);
			script.runInNewContext(context);
		} catch (e) {
			this.errorHandler(e);
		}
		return execEnv.module.exports;
	}
}
