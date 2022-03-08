import type { RunnerParameters } from "./runner";
import { RunnerV1 } from "./runner/v1";

export function createRunnerV1(params: RunnerParameters): RunnerV1 {
	return new RunnerV1(params);
}

export function getFilePath(): string {
	return __filename;
}
