import * as path from "path";
import type { AssetLoadError, ScriptAsset, ScriptAssetRuntimeValue } from "@akashic/pdi-types";
import { loadFile } from "../../../../../utils";
import type { RunnerLoadFileHandler } from "../../../../types";
import type { Asset } from "../Asset";
import { NodeScriptAsset } from "../NodeScriptAsset";

function createMockRuntimeValue(id: string): ScriptAssetRuntimeValue {
	const exports = {};
	return {
		game: {},
		exports,
		filename: "",
		dirname: "",
		module: {
			require,
			exports,
			id,
			filename: "",
			parent: null,
			loaded: false,
			children: [],
			paths: []
		}
	};
}

describe("NodeScriptAsset", () => {
	const testScriptPath = path.join(__dirname, "fixtures", "test.js");
	const loadFileHandler: RunnerLoadFileHandler = (url, encoding, callback) => {
		loadFile(url, encoding)
			.then((text) => {
				callback(null, text);
			})
			.catch((e) => {
				callback(e);
			});
	};

	it("can execute script file as a CommonJS-like module", (done) => {
		const mockRuntimeValue = createMockRuntimeValue("test");
		const script = new NodeScriptAsset({
			id: "id",
			path: testScriptPath,
			errorHandler: (error) => void done(error),
			loadFileHandler
		});
		script._load({
			_onAssetLoad(asset: ScriptAsset) {
				const exports = mockRuntimeValue.module.exports;
				asset.execute(mockRuntimeValue);
				expect(exports.foo).toBe(42);
				expect(exports.bar(5)).toBe(25); // 5 ** 2
				done();
			},
			_onAssetError(_asset: Asset, error: AssetLoadError) {
				done(error);
			}
		});
	});

	it("can export an array of strings specified in exports field", (done) => {
		const mockRuntimeValue = createMockRuntimeValue("test");
		const exports = mockRuntimeValue.exports;
		const script = new NodeScriptAsset({
			id: "id",
			path: testScriptPath,
			exports: ["localVariable", "localVariable2", "undefinedValue"],
			errorHandler: (error) => void done(error),
			loadFileHandler
		});
		script._load({
			_onAssetLoad(asset: ScriptAsset) {
				asset.execute(mockRuntimeValue);
				expect(exports.foo).toBe(42);
				expect(exports.bar(5)).toBe(25); // 5 ** 2
				expect(exports.localVariable).toBe("local");
				expect(exports.localVariable2).toBe("local2");
				expect(exports.undefinedValue).toBeUndefined(); // 未定義の変数を指定してもエラーとならないことを確認
				done();
			},
			_onAssetError(_asset: Asset, error: AssetLoadError) {
				done(error);
			}
		});
	});
});
