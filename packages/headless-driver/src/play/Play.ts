export type PlayStatus = "preparing" | "running" | "suspending" | "broken";

export interface Play {
	playId: string;
	status: PlayStatus;
	contentUrl: string;
	createdAt: number;
	lastSuspendedAt: number | null;
}
