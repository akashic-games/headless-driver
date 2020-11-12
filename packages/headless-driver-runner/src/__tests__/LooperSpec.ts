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

	it("Looper#debugStart(), debugStop(), advance()", async () => {
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

		// case 1-1: Looper#start() 前に Looper#debugStart() が呼ばれてはならない
		expect(looper.debugStart()).toBe(false);

		// case 1-2: Looper#start() 前に Looper#debugStop() が呼ばれてはならない
		expect(looper.debugStop()).toBe(false);

		looper.start();
		await sleep(400);

		// case 2-1: Looper#start() 後に Looper#debugStop() が呼ばれたらループを停止できる
		const count2_1 = loopCount;
		expect(looper.debugStop()).toBe(true);
		await sleep(400);
		expect(loopCount).toBe(count2_1);

		// case 2-1-1: Looper#debugStop() 後に Looper#advance() が呼ばれたらループを進めることができる
		const count2_1_1 = loopCount;
		looper.advance(1000);
		expect(loopCount).toBeGreaterThan(count2_1_1);

		// case 2-2: Looper#debugStop() 後に Looper#debugStart() が呼ばれたらループを再開できる
		const count2_2 = loopCount;
		expect(looper.debugStart()).toBe(true);
		await sleep(200);
		expect(loopCount).toBeGreaterThan(count2_2);

		const lastLoopCount = loopCount;
		looper.stop();

		// case 3-1: Looper#stop() 後に Looper#debugStop() が呼ばれても何もしない
		expect(looper.debugStop()).toBe(false);
		await sleep(400);
		expect(loopCount).toBe(lastLoopCount);

		// case 3-2: Looper#stop() 後に Looper#start() が呼ばれても何もしない
		expect(looper.debugStart()).toBe(false);
		await sleep(200);
		expect(loopCount).toBe(lastLoopCount);
	});
});
