import type { SystemLogger } from "../../Logger";

export class SilentLogger implements SystemLogger {
	info(..._messages: any[]): void {
		// console.info(...messages); // tslint:disable-line:no-console
	}
	debug(..._messages: any[]): void {
		// console.debug(...messages); // tslint:disable-line:no-console
	}
	warn(..._messages: any[]): void {
		// console.warn(...messages); // tslint:disable-line:no-console
	}
	error(..._messages: any[]): void {
		// console.error(...messages); // tslint:disable-line:no-console
	}
}
