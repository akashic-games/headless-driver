// SandBoxの内側でのみ使用可能な関数の宣言
interface TrustedFunctions {
	engineFiles(): any | undefined;
}

declare var trustedFunctions: TrustedFunctions;
