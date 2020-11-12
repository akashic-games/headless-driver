export class Looper {
	protected _running: boolean;
	protected _fun: (deltaTime: number) => number;
	protected _timerId: NodeJS.Timer;
	protected _prev: number;
	protected _errorHandler: (err: any) => void;

	constructor(fun: (deltaTime: number) => number, errorHandler: (err: any) => void) {
		this._fun = fun;
		this._timerId = null;
		this._prev = 0;
		this._running = false;
		this._errorHandler = errorHandler;
	}

	/**
	 * この Looper に紐付いたハンドラを定期実行を開始する。
	 * このメソッドは Platform を経由して暗黙的に呼ばれ、それ以外から呼び出してはならない。
	 * 同様の機能を利用する場合は `this.debugStart()` を呼ぶこと。
	 */
	start(): void {
		this._running = true;
		this.setLooperInterval();
	}

	/**
	 * この Looper に紐付いたハンドラの定期実行を停止する。
	 * このメソッドは Platform を経由して暗黙的に呼ばれ、それ以外から呼び出してはならない。
	 * 同様の機能を利用する場合は `this.debugStop()` を呼ぶこと。
	 */
	stop(): void {
		this._running = false;
		this.clearLooperInterval();
	}

	/**
	 * この Looper に紐付いたハンドラの定期実行を開始する。
	 * Looper#start() から Looper#stop() の間に呼ばれなければならない。
	 * この範囲内で呼ばれた場合は `true` を、この範囲外で呼ばれた場合は何もせず `false` を返す。
	 */
	debugStart(): boolean {
		if (!this._running) {
			return false;
		}
		this.setLooperInterval();
		return true;
	}

	/**
	 * この Looper に紐付いたハンドラの定期実行を停止する。
	 * Looper#start() から Looper#stop() の間に呼ばれなければならない。
	 * この範囲内で呼ばれた場合は `true` を、この範囲外で呼ばれた場合は何もせず `false` を返す。
	 */
	debugStop(): boolean {
		if (!this._running) {
			return false;
		}
		this.clearLooperInterval();
		return true;
	}

	/**
	 * この Looper による紐付いたハンドラを、指定ミリ秒進めて実行する。
	 * @param ms 進めるミリ秒
	 */
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
