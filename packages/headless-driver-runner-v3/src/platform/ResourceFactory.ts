import { akashicEngine as g } from "@akashic/engine-files";
import { NodeScriptAsset } from "./assets/NodeScriptAsset";
import { NodeTextAsset } from "./assets/NodeTextAsset";
import { NullAudioAsset } from "./assets/NullAudioAsset";
import { NullImageAsset } from "./assets/NullImageAsset";
import { NullVideoAsset } from "./assets/NullVideoAsset";
import { NullAudioPlayer } from "./NullAudioPlayer";
import { NullGlyphFactory } from "./NullGlyphFactory";
import { NullSurface } from "./NullSurface";
import { NullSurfaceAtlas } from "./NullSurfaceAtlas";

export class ResourceFactory implements g.ResourceFactory {
	private errorHandler: (err: any) => void;

	constructor(errorHandler: (err: any) => void) {
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
		return new NodeTextAsset(id, assetPath);
	}

	createScriptAsset(id: string, assetPath: string): g.ScriptAsset {
		return new NodeScriptAsset(id, assetPath, this.errorHandler);
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

	createSurfaceAtlas(width: number, height: number): g.SurfaceAtlas {
		return new NullSurfaceAtlas(this.createSurface(width, height));
	}
}
