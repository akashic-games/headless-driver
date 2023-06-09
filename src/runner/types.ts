export type RunnerExecutionMode = "active" | "passive";

export type RunnerRenderingMode = "none" | "canvas";

export type RunnerAdvanceConditionFunc = () => boolean;

export interface RunnerPointEvent {
	type: "down" | "move" | "up";
	identifier: number;
	offset: {
		x: number;
		y: number;
	};
	button?: number;
}

export interface RunnerPlayer {
	id: string;
	name: string;
}
