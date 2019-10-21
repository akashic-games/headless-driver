export interface ReadFileOption {
	encoding?: string;
	json?: boolean;
}

/**
 * テキストファイルの読み込みを行う。
 *
 * @param url url または path
 */
export async function loadFile(url: string): Promise<string>;

/**
 * ファイルの読み込みを行う。
 *
 * @param url url または path
 * @param opt オプション
 */
export async function loadFile<T>(url: string, opt?: ReadFileOption): Promise<T>;

export async function loadFile<T>(url: string, opt?: ReadFileOption): Promise<T> {
	const isVmFuncDefined = new Function(`return typeof vmLoadFile === "function"`);
	if (isVmFuncDefined()) {
		// RunnerManager の vm.sandbox で定義された function が存在する場合は、VM上で動作する。
		const vmLoadFunc = new Function("url", "opt", "return vmLoadFile(url, opt);");
		return await vmLoadFunc(url, opt);
	} else {
		// vm により require が制限されているため、hostで動作するこのpathでモジュールを読み込む。
		const fs = require("fs");
		const fetch = require("node-fetch");
		if (isHttpProtocol(url)) {
			const res = await fetch(url, { method: "GET" });
			return opt.json ? res.json() : res.text();
		} else {
			const str = fs.readFileSync(url, { encoding: opt.encoding ? opt.encoding : "utf8" });
			return opt.json ? JSON.parse(str) : str;
		}
	}
}

export function isHttpProtocol(url: string): boolean {
	return /^(http|https)\:\/\//.test(url);
}
