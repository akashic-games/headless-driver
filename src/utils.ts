import * as fs from "fs";
import fetch from "node-fetch";

interface WaitingInfo {
	url: string;
	resolve: (s: string) => void;
	reject: (e: any) => void;
}

const waitings: WaitingInfo[] = [];
let loadingCount: number = 0;

/**
 * ファイルを読み込む。
 *
 * @param url url または path
 */
export async function loadFile(url: string): Promise<string> {
	const promise = new Promise<string>((resolve, reject) => {
		waitings.push({ url, resolve, reject });
	});
	processWaitingLoad();
	return promise;
}

async function processWaitingLoad(): Promise<void> {
	if (loadingCount >= LoadFileInternal.MAX_PARALLEL_LOAD || waitings.length === 0) return;
	const { url, resolve, reject } = waitings.shift()!;
	try {
		++loadingCount;
		resolve(await LoadFileInternal.loadImpl(url));
	} catch (e) {
		reject(e);
	} finally {
		--loadingCount;
		processWaitingLoad();
	}
}

/**
 * loadFile() の内部実装のうち、特にテストのため外部から参照するものをまとめた namespace 。
 * 通常の利用では参照する必要はない。
 */
export namespace LoadFileInternal {
	/**
	 * 最大並列ロード数。
	 * 環境によって、一定数以上の fetch() を並列に実行すると応答がなくなったりエラーになる場合がある。
	 * 具体的な値は調整の余地がある。少なくとも Windows 環境で、128 以上で問題が起きることがわかっている。
	 */
	export const MAX_PARALLEL_LOAD = 32;

	export async function loadImpl(url: string): Promise<string> {
		if (isHttpProtocol(url)) {
			const res = await fetch(url, { method: "GET" });
			return res.text();
		} else {
			const str = fs.readFileSync(url, { encoding: "utf8" });
			return str;
		}
	}
}

export function isHttpProtocol(url: string): boolean {
	return /^(http|https)\:\/\//.test(url);
}
