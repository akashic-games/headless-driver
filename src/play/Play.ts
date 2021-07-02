import { ContentLocation } from "./Content";

export type PlayStatus = "preparing" | "running" | "suspending" | "broken";

export type Play = ContentLocation & BasePlay;

export interface BasePlay {
	playId: string;
	status: PlayStatus;
	createdAt: number;
	lastSuspendedAt: number | null;
}
