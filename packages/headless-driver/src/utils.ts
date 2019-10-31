import { ReadFileOption } from "@akashic/headless-driver-runner";
import { readFileSync } from "fs";
import fetch from "node-fetch";

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

// TODO: fetch, readFileSync 共に、リクエスト先/ファイルの読み込み先を限定する必要がある。
export async function loadFile<T>(url: string, opt?: ReadFileOption): Promise<T> {
	if (isHttpProtocol(url)) {
		const res = await fetch(url, { method: "GET" });
		return opt.json ? res.json() : res.text();
	} else {
		const str = readFileSync(url, { encoding: opt.encoding ? opt.encoding : "utf8" });
		return opt.json ? JSON.parse(str) : str;
	}
}

export function isHttpProtocol(url: string): boolean {
	return /^(http|https)\:\/\//.test(url);
}
