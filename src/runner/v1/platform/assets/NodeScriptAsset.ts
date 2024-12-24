import { createContext, runInContext } from "vm";
import { akashicEngine as g } from "engine-files-v1";
import type { RunnerLoadFileHandler } from "../../../types";

export interface NodeScriptAssetParameters {
	id: string;
	path: string;
	errorHandler: (err: any) => void;
	loadFileHandler: RunnerLoadFileHandler;
}

export class NodeScriptAsset extends g.ScriptAsset {
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
				[
					"(function(exports, require, module, __filename, __dirname) {",
					`${this.script}`,
					"})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);"
				].join("\n"),
				context,
				{
					filename: `${this.path}`,
					lineOffset: -1
				}
			);
		} catch (e) {
			this.errorHandler(e);
		}
		return execEnv.module.exports;
	}
}
