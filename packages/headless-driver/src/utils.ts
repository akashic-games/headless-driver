import * as fs from "fs";
import fetch from "node-fetch";

/**
 * ファイルを読み込む。
 *
 * @param url url または path
 * @param opt オプション
 */
export async function loadFile(url: string): Promise<string> {
	if (isHttpProtocol(url)) {
		const res = await fetch(url, { method: "GET" });
		return res.text();
	} else {
		const str = fs.readFileSync(url, { encoding: "utf8" });
		return str;
	}
}

export function isHttpProtocol(url: string): boolean {
	return /^(http|https)\:\/\//.test(url);
}
