export type RunnerExecutionMode = "active" | "passive";

export type RunnerRenderingMode = "none" | "node-canvas";

export type RunnerAdvanceConditionFunc = () => boolean;

export interface RunnerPointEvent {
	type: "down" | "move" | "up";
	identifier: number;
	offset: {
		x: number;
		y: number;
	};
}

export interface RunnerPlayer {
	id: string;
	name: string;
}
