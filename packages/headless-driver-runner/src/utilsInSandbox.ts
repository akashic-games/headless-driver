import { ReadFileOption } from "./utils";

export async function loadFileInSandbox<T>(url: string, opt?: ReadFileOption): Promise<T> {
	return await trustedFunctions.loadFile(url, opt);
}
