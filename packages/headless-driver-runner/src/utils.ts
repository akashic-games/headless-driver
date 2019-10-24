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

// SandBox内でのみ使用可能な関数の宣言
declare function vmLoadFile<T>(url: string, opt?: ReadFileOption): Promise<T>;

export async function loadFileInVm<T>(url: string, opt?: ReadFileOption): Promise<T> {
	return await vmLoadFile(url, opt);
}

export function isHttpProtocol(url: string): boolean {
	return /^(http|https)\:\/\//.test(url);
}
