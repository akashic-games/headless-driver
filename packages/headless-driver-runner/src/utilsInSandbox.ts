import { ReadFileOption } from "./utils";

/**
 * ファイルの読み込みを行う。
 * SandBox 内で使用する。
 *
 * @param url url または path
 * @param opt オプション
 */
export async function loadFileInSandbox<T>(url: string, opt?: ReadFileOption): Promise<T> {
	return await trustedFunctions.loadFile(url, opt);
}
