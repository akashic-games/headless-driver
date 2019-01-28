export interface SystemLogger {
	info(...messages: any[]): void;
	debug(...messages: any[]): void;
	warn(...messages: any[]): void;
	error(...messages: any[]): void;
}

let _logger: SystemLogger = console;

export function setSystemLogger(logger: SystemLogger): void {
	_logger = logger;
}

export function getSystemLogger(): SystemLogger {
	return _logger;
}
