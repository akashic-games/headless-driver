import { Looper } from "../Looper";

function sleep(duration: number): Promise<void> {
	return new Promise((resolve, _reject) => {
		setTimeout(resolve, duration);
	});
}

describe("Looper", () => {
	it("Looper#start(), stop()", async () => {
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
		await sleep(500);
		expect(loopCount).toBeGreaterThan(10); // 500 ms あれば確実に超えるであろう値 (厳密な値は実行環境に依存する)

		const count = loopCount;
		looper.stop();
		await sleep(500);
		expect(loopCount).toBe(count); // Looper#stop() 後にループ処理が実行されない
	});
});
