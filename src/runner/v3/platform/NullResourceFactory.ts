import type { akashicEngine as g } from "../engineFiles";
import { NodeScriptAsset } from "./assets/NodeScriptAsset";
import { NodeTextAsset } from "./assets/NodeTextAsset";
import { NullAudioAsset } from "./audios/NullAudioAsset";
import { NullAudioPlayer } from "./audios/NullAudioPlayer";
import { NullGlyphFactory } from "./graphics/null/NullGlyphFactory";
import { NullImageAsset } from "./graphics/null/NullImageAsset";
import { NullSurface } from "./graphics/null/NullSurface";
import { NullVideoAsset } from "./videos/NullVideoAsset";

export interface NullResourceFactoryParameters {
	loadFileHandler: (url: string, callback: (err: Error | null, data?: string) => void) => void;
	errorHandler: (err: Error) => void;
}

/**
 * 描画出力や音声再生機能を持たない最小限の ResourceFactory の実装。
 */
export class NullResourceFactory implements g.ResourceFactory {
	private loadFileHandler: (url: string, callback: (err: Error | null, data?: string) => void) => void;
	private errorHandler: (err: Error) => void;

	constructor({ loadFileHandler, errorHandler }: NullResourceFactoryParameters) {
		this.loadFileHandler = loadFileHandler;
		this.errorHandler = errorHandler;
	}

	createImageAsset(id: string, assetPath: string, width: number, height: number): g.ImageAsset {
		return new NullImageAsset(id, assetPath, width, height);
	}

	createVideoAsset(
		id: string,
		assetPath: string,
		width: number,
		height: number,
		system: g.VideoSystem,
		loop: boolean,
		useRealSize: boolean
	): g.VideoAsset {
		return new NullVideoAsset(id, assetPath, width, height, system, loop, useRealSize);
	}

	createAudioAsset(
		id: string,
		assetPath: string,
		duration: number,
		system: g.AudioSystem,
		loop: boolean,
		hint: g.AudioAssetHint,
		offset?: number
	): g.AudioAsset {
		return new NullAudioAsset(id, assetPath, duration, system, loop, hint, offset ?? 0);
	}

	createAudioPlayer(system: g.AudioSystem): g.AudioPlayer {
		return new NullAudioPlayer(system);
	}

	createTextAsset(id: string, assetPath: string): g.TextAsset {
		return new NodeTextAsset({
			id,
			path: assetPath,
			loadFileHandler: this.loadFileHandler
		});
	}

	createScriptAsset(id: string, assetPath: string): g.ScriptAsset {
		return new NodeScriptAsset({
			id,
			path: assetPath,
			errorHandler: this.errorHandler,
			loadFileHandler: this.loadFileHandler
		});
	}

	createSurface(width: number, height: number): g.Surface {
		return new NullSurface(width, height);
	}

	createGlyphFactory(
		fontFamily: string | string[],
		fontSize: number,
		baselineHeight?: number,
		fontColor?: string,
		strokeWidth?: number,
		strokeColor?: string,
		strokeOnly?: boolean,
		fontWeight?: g.FontWeightString
	): g.GlyphFactory {
		return new NullGlyphFactory(fontFamily, fontSize, baselineHeight, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight);
	}
}
