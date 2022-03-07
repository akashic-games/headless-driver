// SandBoxの内側でのみ使用可能な関数の宣言
interface TrustedFunctions {
	engineFiles(): any | undefined;
}
// グローバルスコープのため var を許容
// eslint-disable-next-line no-var
declare var trustedFunctions: TrustedFunctions;
