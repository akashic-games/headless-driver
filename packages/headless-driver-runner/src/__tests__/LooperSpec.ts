import { Looper } from "../Looper";

describe("Looper", () => {
	it("Looper#start(), stop()", () => {
		jest.useFakeTimers();

		let loopCount = 0;
		const looper = new Looper(
			(_delta: number) => {
				loopCount++;
				return 0;
			},
			(_err: any) => {
				//
			}
		);

		looper.start();
		jest.advanceTimersByTime(500);
		expect(loopCount).toBeGreaterThan(10); // 500 ms あれば確実に超えるであろう値 (厳密な値は実行環境に依存する)

		const count = loopCount;
		looper.stop();
		jest.advanceTimersByTime(500);
		expect(loopCount).toBe(count); // Looper#stop() 後にループ処理が実行されない
	});
});
