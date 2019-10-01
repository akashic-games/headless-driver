import { RunnerParameters } from "@akashic/headless-driver-runner";
import { RunnerV1 } from "@akashic/headless-driver-runner-v1";
import { RunnerV2 } from "@akashic/headless-driver-runner-v2";

export function createRunnerV2(params: RunnerParameters, stopCallBack: (runnerId: string) => Promise<void>): RunnerV2 {
	const runner = new RunnerV2(params);
	runner.errorTrigger.addOnce((err: any) => {
		stopCallBack(params.runnerId);
	});
	return runner;
}

export function createRunnerV1(params: RunnerParameters, stopCallBack: (runnerId: string) => Promise<void>): RunnerV1 {
	const runner = new RunnerV1(params);
	runner.errorTrigger.addOnce((err: any) => {
		stopCallBack(params.runnerId);
	});
	return runner;
}

export function getFilePath(): string {
	return __filename;
}
