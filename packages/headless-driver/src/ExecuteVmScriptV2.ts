import { RunnerParameters } from "@akashic/headless-driver-runner";
import { RunnerV2 } from "@akashic/headless-driver-runner-v2";

export function createRunnerV2(params: RunnerParameters): RunnerV2 {
	return new RunnerV2(params);
}

export function getFilePath(): string {
	return __filename;
}
