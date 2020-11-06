export class Looper {
	private _fun: (deltaTime: number) => number;
	private _timerId: NodeJS.Timer;
	private _prev: number;
	private _errorHandler: (err: any) => void;

	private _running: boolean;

	/**
	 * コンテンツの一時停止を外部からリクエストされているか
	 */
	private _debugStarted: boolean;

	/**
	 * game-driverがプレイを続行する状態になっているかどうか
	 */
	private _platformStarted: boolean;

	/**
	 * 1stepで進める時間
	 */
	private _stepDelta: number;

	constructor(fun: (deltaTime: number) => number, errorHandler: (err: any) => void) {
		this._fun = fun;
		this._timerId = null;
		this._prev = 0;
		this._errorHandler = errorHandler;
		this._running = false;
		this._debugStarted = true;
		this._platformStarted = false;
		this._stepDelta = 1000 / 60;
	}

	start(): void {
		this._platformStarted = true;
		this._update();
	}

	stop(): void {
		this._platformStarted = false;
		this._update();
	}

	debugStart(): void {
		this._debugStarted = true;
		this._update();
	}

	debugStop(): void {
		this._debugStarted = false;
		this._update();
	}

	debugStep(): void {
		try {
			this._fun(this._stepDelta);
		} catch (e) {
			this._errorHandler(e);
		}
	}

	private _update(): void {
		const needsCallRunning = this._debugStarted && this._platformStarted;
		if (!this._running && needsCallRunning) {
			this._start();
		} else if (this._running && !needsCallRunning) {
			this._stop();
		}
	}

	private _start(): void {
		this._running = true;
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
				this._platformStarted = false;
				this._stop(); // TODO: 例外発生時止めてしまうのがいいのか検討
			}
			this._prev = now;
		}, 16);
	}

	private _stop(): void {
		this._running = false;
		clearInterval(this._timerId);
		this._timerId = null;
		this._prev = 0;
	}
}
