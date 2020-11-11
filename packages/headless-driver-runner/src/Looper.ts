export class Looper {
	protected _fun: (deltaTime: number) => number;
	protected _timerId: NodeJS.Timer;
	protected _prev: number;
	protected _errorHandler: (err: any) => void;

	constructor(fun: (deltaTime: number) => number, errorHandler: (err: any) => void) {
		this._fun = fun;
		this._timerId = null;
		this._prev = 0;
		this._errorHandler = errorHandler;
	}

	start(): void {
		this.setLooperInterval();
	}

	stop(): void {
		this.clearLooperInterval();
	}

	advance(ms: number): void {
		try {
			this._fun(ms);
		} catch (e) {
			this._errorHandler(e);
		}
	}

	protected setLooperInterval(): void {
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
				this.stop(); // TODO: 例外発生時に止めてしまってよいか検討
			}
			this._prev = now;
		}, 16);
	}

	protected clearLooperInterval(): void {
		if (this._timerId == null) {
			return;
		}
		clearInterval(this._timerId);
		this._timerId = null;
		this._prev = 0;
	}
}
