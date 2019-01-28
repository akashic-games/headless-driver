export class Looper {
	private _fun: (deltaTime: number) => number;
	private _timerId: NodeJS.Timer;
	private _prev: number;
	private _errorHandler: (err: any) => void;

	constructor(fun: (deltaTime: number) => number, errorHandler: (err: any) => void) {
		this._fun = fun;
		this._timerId = null;
		this._prev = 0;
		this._errorHandler = errorHandler;
	}

	start(): void {
		try {
			this._fun(0);
		} catch (e) {
			this._errorHandler(e);
			return;
		}
		this._prev = Date.now();
		this._timerId = setInterval(() => {
			const now = Date.now();
			try {
				this._fun(now - this._prev);
			} catch (e) {
				this._errorHandler(e);
				this.stop();
			}
			this._prev = now;
		}, 16);
	}

	stop(): void {
		clearInterval(this._timerId);
		this._timerId = null;
		this._prev = 0;
	}
}
