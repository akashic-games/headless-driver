import type { EncodingType } from "../utils";

export type RunnerExecutionMode = "active" | "passive";

export type RunnerLoopMode = "realtime" | "replay";

export type RunnerRenderingMode = "none" | "canvas";

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

// TODO: Union Types 等で data を静的に型定義できるように
export type RunnerLoadFileHandler = (
	url: string,
	encoding: EncodingType,
	callback: (err: Error | null, data?: string | Uint8Array) => void
) => void;
