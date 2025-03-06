import * as fs from "fs";
import fetch from "node-fetch";

interface WaitingInfo {
	url: string;
	encoding: EncodingType;
	resolve: (s: string | Uint8Array) => void;
	reject: (e: any) => void;
}

const waitings: WaitingInfo[] = [];
let loadingCount: number = 0;

export type EncodingType = "utf-8" | "uint8array";

/**
 * ファイルを読み込む。
 *
 * @param url url または path
 */
export async function loadFile(url: string, encoding: EncodingType): Promise<string | Uint8Array>;
export async function loadFile(url: string, encoding: "utf-8"): Promise<string>;
export async function loadFile(url: string, encoding: "uint8array"): Promise<Uint8Array>;
export async function loadFile(url: string, encoding: EncodingType = "utf-8"): Promise<string | Uint8Array> {
	const promise = new Promise<string | Uint8Array>((resolve, reject) => {
		waitings.push({ url, encoding, resolve, reject });
	});
	void processWaitingLoad(); // 並列ロードのため void 演算子を使用
	return promise;
}

async function processWaitingLoad(): Promise<void> {
	if (loadingCount >= LoadFileInternal.MAX_PARALLEL_LOAD || waitings.length === 0) return;
	const { url, encoding, resolve, reject } = waitings.shift()!;
	try {
		++loadingCount;
		resolve(await LoadFileInternal.loadImpl(url, encoding));
	} catch (e) {
		reject(e);
	} finally {
		--loadingCount;
		void processWaitingLoad();
	}
}

/**
 * loadFile() の内部実装のうち、特にテストのため外部から参照するものをまとめた namespace 。
 * 通常の利用では参照する必要はない。
 */
export namespace LoadFileInternal {
	/**
	 * 最大並列ロード数。
	 * 環境によって、node-fetch を一定数以上並列に実行すると応答がなくなったりエラーになる場合がある。
	 * 具体的な値は調整の余地がある。少なくとも Windows 環境で、128 以上で問題が起きることがわかっている。
	 */
	export const MAX_PARALLEL_LOAD = 32;

	export async function loadImpl(url: string, encoding: EncodingType = "utf-8"): Promise<string | Uint8Array> {
		if (isHttpProtocol(url)) {
			const res = await fetch(url, { method: "GET" });
			if (encoding === "utf-8") {
				return res.text();
			} else {
				// NOTE: vm2 の sandbox 環境外から sandbox 内へ ArrayBuffer を渡してもデータの中身を参照することができない。
				// おそらく Proxy の挙動によるものだと推測されるが原因については精査できていない。
				// 暫定対応として ArrayBuffer の代わりに Uint8Array を渡し、 sandbox 内で ArrayBuffer のインスタンスを生成するようにする。
				const arrayBuffer = await res.arrayBuffer();
				return new Uint8Array(arrayBuffer);
			}
		} else {
			if (encoding === "utf-8") {
				return fs.readFileSync(url, { encoding: "utf-8" });
			} else {
				// 上記 NOTE と同様の理由により Uint8Array を返す。
				const buffer = fs.readFileSync(url, { encoding: null });
				return Uint8Array.from(buffer);
			}
		}
	}
}

export function isHttpProtocol(url: string): boolean {
	return /^(http|https)\:\/\//.test(url);
}

// @see https://nodejs.org/api/url.html#urlresolvefrom-to
export function resolveUrl(from: string, to: string): string {
	const resolvedUrl = new URL(to, new URL(from, "resolve://"));
	if (resolvedUrl.protocol === "resolve:") {
		// `from` is a relative URL.
		const { pathname, search, hash } = resolvedUrl;
		return pathname + search + hash;
	}
	return resolvedUrl.toString();
}
