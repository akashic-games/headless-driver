import { akashicEngine as g } from "engine-files-v2";
import type { RunnerLoadFileHandler } from "../../types";
import { NodeScriptAsset } from "./assets/NodeScriptAsset";
import { NodeTextAsset } from "./assets/NodeTextAsset";
import { NullAudioAsset } from "./assets/NullAudioAsset";
import { NullImageAsset } from "./assets/NullImageAsset";
import { NullVideoAsset } from "./assets/NullVideoAsset";
import { NullAudioPlayer } from "./NullAudioPlayer";
import { NullGlyphFactory } from "./NullGlyphFactory";
import { NullSurface } from "./NullSurface";

export interface ResourceFactoryParameters {
	loadFileHandler: RunnerLoadFileHandler;
	errorHandler: (err: any) => void;
}

export class ResourceFactory extends g.ResourceFactory {
	private loadFileHandler: RunnerLoadFileHandler;
	private errorHandler: (err: any) => void;

	constructor({ loadFileHandler, errorHandler }: ResourceFactoryParameters) {
		super();
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
		return new NullSurface(width, height);
	}

	createGlyphFactory(
		fontFamily: g.FontFamily | string | (g.FontFamily | string)[],
		fontSize: number,
		baselineHeight?: number,
		fontColor?: string,
		strokeWidth?: number,
		strokeColor?: string,
		strokeOnly?: boolean,
		fontWeight?: g.FontWeight
	): g.GlyphFactory {
		return new NullGlyphFactory(fontFamily, fontSize, baselineHeight, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight);
	}
}
