import { RunnerParameters } from "@akashic/headless-driver-runner";
import { RunnerV1 } from "@akashic/headless-driver-runner-v1";
import * as path from "path";

export function createRunnerV1(params: RunnerParameters): RunnerV1 {
	return new RunnerV1(params);
}

export function getFilePath(): string {
	// vm2 で実行するためにビルド生成結果の js ファイルのパスが必要となる。
	// テストでは ts-jest により ts ファイルが参照されるため、動的に js のパスを組み立てている。
	const basename = path.basename(__filename, path.extname(__filename));
	return path.join(__dirname, "..", "lib", basename + ".js");
}
