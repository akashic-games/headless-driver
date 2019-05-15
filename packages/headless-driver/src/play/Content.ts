export type ContentLocation = (ContentParameters | GameJsonParameters);

interface ContentParameters {
	/**
	 * content.json の URL。
	 */
	contentUrl: string;
}

interface GameJsonParameters {
	/**
	 * game.json のディレクトリ。
	 */
	gameJsonPath: string;
}
