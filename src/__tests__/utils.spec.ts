import { join } from "path";
import { loadFile, LoadFileInternal } from "../utils";

const assetBaseUrlV3 = process.env.ASSET_BASE_URL_V3!;

describe("utils.loadFile()", () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("HTTP 経由でファイルをロードできる", async () => {
		expect(await loadFile(assetBaseUrlV3 + "/assets/akashic.bin", "utf-8")).toBe("akashic!!");
		expect(await loadFile(assetBaseUrlV3 + "/assets/akashic.bin", "uint8array")).toEqual(
			Uint8Array.from([97, 107, 97, 115, 104, 105, 99, 33, 33]) // akashic!!
		);
	});

	it("ローカルのファイルをロードできる", async () => {
		expect(await loadFile(join(__dirname, "fixtures", "content-v3", "assets", "akashic.bin"), "utf-8")).toBe("akashic!!");
		expect(await loadFile(join(__dirname, "fixtures", "content-v3", "assets", "akashic.bin"), "uint8array")).toEqual(
			Uint8Array.from([97, 107, 97, 115, 104, 105, 99, 33, 33]) // akashic!!
		);
	});

	it("並列ロード数を制限する", async () => {
		const resolverTable: { [url: string]: () => void } = {};
		jest.spyOn(LoadFileInternal, "loadImpl").mockImplementation((url) => {
			return new Promise((resolve) => {
				resolverTable[url] = () => {
					delete resolverTable[url];
					resolve("content:" + url);
				};
			});
		});

		const promiseTable: { [url: string]: Promise<string> } = {};
		function load(url: string): void {
			promiseTable[url] = loadFile(url, "utf-8");
		}

		for (let i = 0; i < LoadFileInternal.MAX_PARALLEL_LOAD; ++i) {
			load("test-" + i);
		}
		load("delayed-1");
		load("delayed-2");

		// (MAX_PARALLEL_LOAD + 2) のロードを同期的に実行したが、冒頭 MAX_PARALLEL_LOAD 個しかロード処理が走らない。
		expect(Object.keys(resolverTable).length).toBe(LoadFileInternal.MAX_PARALLEL_LOAD);
		expect(resolverTable["test-" + (LoadFileInternal.MAX_PARALLEL_LOAD - 1)]).not.toBe(undefined);
		expect(resolverTable["delayed-1"]).toBe(undefined);
		expect(resolverTable["delayed-2"]).toBe(undefined);

		// 一つロードを完了すると次 (delayed-1) のロードが走る。
		resolverTable["test-2"]();
		const test2content = await promiseTable["test-2"];
		expect(test2content).toBe("content:test-2");
		expect(Object.keys(resolverTable).length).toBe(LoadFileInternal.MAX_PARALLEL_LOAD);
		expect(resolverTable["delayed-1"]).not.toBe(undefined);
		expect(resolverTable["delayed-2"]).toBe(undefined);

		// さらにロードを完了すると次 (delayed-2) のロードが走る。
		resolverTable["test-1"]();
		await promiseTable["test-1"];
		expect(Object.keys(resolverTable).length).toBe(LoadFileInternal.MAX_PARALLEL_LOAD);
		expect(resolverTable["delayed-1"]).not.toBe(undefined);
		expect(resolverTable["delayed-2"]).not.toBe(undefined);

		// さらにロードを完了すると、その後のロードもただちに走る。
		resolverTable["test-0"]();
		await promiseTable["test-0"];
		expect(Object.keys(resolverTable).length).toBe(LoadFileInternal.MAX_PARALLEL_LOAD - 1);
		load("delayed-3");
		expect(Object.keys(resolverTable).length).toBe(LoadFileInternal.MAX_PARALLEL_LOAD);
		expect(resolverTable["delayed-3"]).not.toBe(undefined);

		// 最終的に全部のロードが完了する。
		Object.values(resolverTable).forEach((r) => r());
		const contents = await Promise.all(Object.values(promiseTable));
		expect(contents.length).toBe(LoadFileInternal.MAX_PARALLEL_LOAD + 3); // test-0〜(MAX_PARALLEL_LOAD-1) と delayed-1〜3
	});
});
