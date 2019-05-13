export type PlayStatus = "preparing" | "running" | "suspending" | "broken";

export type Play = (PlayWithContentUrl | PlayWithContentDir) & BasePlay;

export interface BasePlay {
	playId: string;
	status: PlayStatus;
	createdAt: number;
	lastSuspendedAt: number | null;
}

export interface PlayWithContentUrl {
	contentUrl: string;
}

export interface PlayWithContentDir {
	/**
	 * game.json を含むディレクトリ。
	 */
	contentDir: string;
	contentConfig?: {
		externals?: string[];
	};
}
