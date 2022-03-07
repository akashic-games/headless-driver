import { Canvas } from "canvas";
import type { akashicEngine as g } from "../engineFiles";
import { NodeScriptAsset } from "./assets/NodeScriptAsset";
import { NodeTextAsset } from "./assets/NodeTextAsset";
import { NullAudioAsset } from "./audios/NullAudioAsset";
import { NullAudioPlayer } from "./audios/NullAudioPlayer";
import { NodeCanvasGlyphFactory } from "./graphics/canvas/NodeCanvasGlyphFactory";
import { NodeCanvasImageAsset } from "./graphics/canvas/NodeCanvasImageAsset";
import { NodeCanvasSurface } from "./graphics/canvas/NodeCanvasSurface";
import { NullVideoAsset } from "./videos/NullVideoAsset";

export interface NodeCanvasResourceFactoryParameters {
	loadFileHandler: (url: string, callback: (err: Error | null, data?: string) => void) => void;
	errorHandler: (err: Error) => void;
}

/**
 * node-canvas への描画出力機能を持つ ResourceFactory の実装。
 * 音声再生には未対応。
 */
export class NodeCanvasResourceFactory implements g.ResourceFactory {
	private loadFileHandler: (url: string, callback: (err: Error | null, data?: string) => void) => void;
	private errorHandler: (err: Error) => void;

	constructor({ loadFileHandler, errorHandler }: NodeCanvasResourceFactoryParameters) {
		this.loadFileHandler = loadFileHandler;
		this.errorHandler = errorHandler;
	}

	createImageAsset(id: string, assetPath: string, width: number, height: number): g.ImageAsset {
		return new NodeCanvasImageAsset(id, assetPath, width, height);
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
		hint: g.AudioAssetHint
	): g.AudioAsset {
		return new NullAudioAsset(id, assetPath, duration, system, loop, hint);
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
		const canvas = new Canvas(width, height);
		return new NodeCanvasSurface(canvas);
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
		return new NodeCanvasGlyphFactory(
			fontFamily,
			fontSize,
			baselineHeight,
			fontColor,
			strokeWidth,
			strokeColor,
			strokeOnly,
			fontWeight
		);
	}
}
