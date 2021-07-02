import * as fs from "fs";
import * as path from "path";
import type * as engineFiles from "aev2";

/**
 * 環境に応じた適当な engineFiles を返す。
 */
export function requireEngineFiles(): typeof engineFiles | undefined {
	if (process.env.ENGINE_FILES_V2_PATH) {
		const engineFilesPath = path.isAbsolute(process.env.ENGINE_FILES_V2_PATH)
			? process.env.ENGINE_FILES_V2_PATH
			: path.resolve(process.cwd(), process.env.ENGINE_FILES_V2_PATH);
		if (!fs.existsSync(engineFilesPath)) {
			throw new Error(`ENGINE_FILES_V2_PATH: ${engineFilesPath} was not found.`);
		}
		return require(engineFilesPath);
	}

	return undefined;
}
