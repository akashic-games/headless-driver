export class TimeKeeper {
	_currentTime: number = 0;

	// NOTE: this を束縛するためアロー関数で定義
	now: () => number = () => {
		return this._currentTime;
	};

	advance(ms: number): void {
		this._currentTime += ms;
	}

	rewind(): void {
		this._currentTime = 0;
	}

	set(time: number): void {
		this._currentTime = time;
	}
}
