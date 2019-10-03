import { RunnerParameters } from "@akashic/headless-driver-runner";
import { RunnerV2 } from "@akashic/headless-driver-runner-v2";
import * as path from "path";

export function createRunnerV2(params: RunnerParameters): RunnerV2 {
	return new RunnerV2(params);
}

export function getFilePath(): string {
	// vm2 で実行するためにビルド生成結果の js ファイルのパスが必要となる。
	const fileName = path.basename(__filename, path.extname(__filename));
	return path.join(__dirname, "..", "lib", fileName + ".js");
}
