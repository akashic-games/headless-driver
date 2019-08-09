export type ContentLocation = ContentParameters | GameJsonParameters;

export interface ContentParameters {
	/**
	 * content.json の URL。
	 */
	contentUrl: string;
}

export interface GameJsonParameters {
	/**
	 * game.json のディレクトリ。
	 */
	gameJsonPath: string;
}
