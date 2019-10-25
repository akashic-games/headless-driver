// SandBoxの内側でのみ使用可能な関数の宣言
interface TrustedFunctions {
	loadFile<T>(url: string, opt?: any): Promise<T>;
}

declare var trustedFunctions: TrustedFunctions;
