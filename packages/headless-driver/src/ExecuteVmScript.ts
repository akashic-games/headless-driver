import { RunnerParameters } from "@akashic/headless-driver-runner";
import { RunnerV1 } from "@akashic/headless-driver-runner-v1";
import { RunnerV2 } from "@akashic/headless-driver-runner-v2";
import * as path from "path";

export function createRunnerV2(params: RunnerParameters): RunnerV2 {
	return new RunnerV2(params);
}

export function createRunnerV1(params: RunnerParameters): RunnerV1 {
	return new RunnerV1(params);
}

export function getFilePath(): string {
	const fileName = path.basename(__filename, path.extname(__filename));
	return path.join(path.dirname(__dirname), "/lib/", fileName + ".js");
}
