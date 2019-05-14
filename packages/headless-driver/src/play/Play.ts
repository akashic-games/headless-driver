export type PlayStatus = "preparing" | "running" | "suspending" | "broken";

export type Play = PlayLocating & BasePlay;

export type PlayLocating = (PlayWithContentUrl | PlayWithGameJsonPath);

export interface BasePlay {
	playId: string;
	status: PlayStatus;
	createdAt: number;
	lastSuspendedAt: number | null;
}

export interface PlayWithContentUrl {
	/**
	 * content.json の URL。
	 */
	contentUrl: string;
}

export interface PlayWithGameJsonPath {
	/**
	 * game.json のディレクトリ。
	 */
	gameJsonPath: string;
}
