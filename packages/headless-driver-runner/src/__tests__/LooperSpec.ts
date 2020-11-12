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
		let latestErr: any;
		const looper = new Looper(
			(_delta: number) => {
				loopCount++;
				return 0;
			},
			(err: any) => {
				latestErr = err;
			}
		);

		// case 1-1: Looper#start() 前に Looper#debugStart() が呼ばれてはならない
		expect(looper.debugStart()).toBe(false);

		// case 1-2: Looper#start() 前に Looper#debugStop() が呼ばれてはならない
		expect(looper.debugStop()).toBe(false);

		// case 1-3: Looper#start() 前に Looper#advande() が呼ばれたら何もせず error を出力
		const count1_3 = loopCount;
		looper.advance(100);
		expect(count1_3).toBe(loopCount);
		expect(latestErr).not.toBeUndefined();
		latestErr = undefined;

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
		expect(latestErr).toBeUndefined();
		expect(loopCount).toBeGreaterThan(count2_1_1);

		// case 2-2: Looper#debugStop() 後に Looper#debugStart() が呼ばれたらループを再開できる
		const count2_2 = loopCount;
		expect(looper.debugStart()).toBe(true);
		await sleep(200);
		expect(loopCount).toBeGreaterThan(count2_2);

		// case 2-2-1: Looper#start() 中に Looper#advance() が呼ばれたら何もせず error を出力する
		const count2_2_1 = loopCount;
		looper.advance(1000);
		expect(latestErr).not.toBeUndefined();
		expect(loopCount).toBe(count2_2_1);
		latestErr = undefined;

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

		// case 3-3: Looper#stop() 後に Looper#advance() が呼ばれても何もせず error を出力する
		looper.advance(1000);
		expect(latestErr).not.toBeUndefined();
		expect(loopCount).toBe(lastLoopCount);
		latestErr = undefined;
	});
});
