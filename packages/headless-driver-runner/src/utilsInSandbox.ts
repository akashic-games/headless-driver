export interface ReadFileOption {
	encoding?: string;
	json?: boolean;
}

/**
 * ファイルの読み込みを行う。
 * SandBox 内で使用する。
 *
 * @param url url または path
 * @param opt オプション
 */
export async function loadFileInSandbox<T>(url: string, opt?: ReadFileOption): Promise<T> {
	validateUrl(url);
	return await trustedFunctions.loadFile(url, opt);
}

declare var allowedPaths: string[];

function validateUrl(url: string): void {
	let isValidPath = false;
	allowedPaths.forEach(path => {
		if (!isValidPath && url.indexOf(path) >= 0) isValidPath = true;
	});
	if (!isValidPath) {
		throw new Error(`Not allowed to read this path. ${url}`);
	}
}
