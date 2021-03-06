import { RunnerParameters } from "@akashic/headless-driver-runner";
import { RunnerV3 } from "@akashic/headless-driver-runner-v3";

export function createRunnerV3(params: RunnerParameters): RunnerV3 {
	return new RunnerV3(params);
}

export function getFilePath(): string {
	return __filename;
}
