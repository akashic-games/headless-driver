export class AMFlowError extends Error {
	name: string;
	message: any;

	constructor(message?: any) {
		super(message);
		this.message = message;
	}
}

export type AMFlowErrorName =
	| "invalid_status"
	| "permission_error"
	| "not_implemented"
	| "timeout"
	| "bad_request"
	| "runtime_error"
	| "token_revoked";

/**
 * 不正な状態
 */
export class InvalidStatusError extends AMFlowError {
	name: string = "InvalidStatus";
}

/**
 * 必要な権限が無い
 */
export class PermissionError extends AMFlowError {
	name: string = "PermissionError";
}

/**
 * 未実装
 */
export class NotImplementedError extends AMFlowError {
	name: string = "NotImplemented";
}

/**
 * タイムアウト
 */
export class TimeoutError extends AMFlowError {
	name: string = "Timeout";
}

/**
 * 不正な要求
 */
export class BadRequestError extends AMFlowError {
	name: string = "BadRequest";
}

/**
 * 実行時エラー
 */
export class RuntimeError extends AMFlowError {
	name: string = "RuntimeError";
}

/**
 * トークンが失効した
 */
export class TokenRevokedError extends AMFlowError {
	name: string = "TokenRevoked";
}

export function createError(type: AMFlowErrorName, message?: any): Error {
	if (type === "invalid_status") {
		return new InvalidStatusError(message);
	} else if (type === "permission_error") {
		return new PermissionError(message);
	} else if (type === "not_implemented") {
		return new NotImplementedError(message);
	} else if (type === "timeout") {
		return new TimeoutError(message);
	} else if (type === "bad_request") {
		return new BadRequestError(message);
	} else if (type === "token_revoked") {
		return new TokenRevokedError(message);
	}
	return new RuntimeError(message);
}
