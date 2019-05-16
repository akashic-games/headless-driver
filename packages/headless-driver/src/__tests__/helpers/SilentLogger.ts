import { SystemLogger } from "../../Logger";

export class SilentLogger implements SystemLogger {
	info(...messages: any[]): void {
		// console.info(...messages); // tslint:disable-line:no-console
	}
	debug(...messages: any[]): void {
		// console.debug(...messages); // tslint:disable-line:no-console
	}
	warn(...messages: any[]): void {
		// console.warn(...messages); // tslint:disable-line:no-console
	}
	error(...messages: any[]): void {
		// console.error(...messages); // tslint:disable-line:no-console
	}
}
