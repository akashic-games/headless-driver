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

export class ResourceFactory implements g.ResourceFactoryLike {
	private errorHandler: (err: any) => void;

	constructor(errorHandler: (err: any) => void) {
		this.errorHandler = errorHandler;
	}

	createImageAsset(id: string, assetPath: string, width: number, height: number): g.ImageAssetLike {
		return new NullImageAsset(id, assetPath, width, height);
	}

	createVideoAsset(
		id: string,
		assetPath: string,
		width: number,
		height: number,
		system: g.VideoSystemLike,
		loop: boolean,
		useRealSize: boolean
	): g.VideoAssetLike {
		return new NullVideoAsset(id, assetPath, width, height, system, loop, useRealSize);
	}

	createAudioAsset(
		id: string,
		assetPath: string,
		duration: number,
		system: g.AudioSystemLike,
		loop: boolean,
		hint: g.AudioAssetHint
	): g.AudioAssetLike {
		return new NullAudioAsset(id, assetPath, duration, system, loop, hint);
	}

	createAudioPlayer(system: g.AudioSystemLike): g.AudioPlayerLike {
		return new NullAudioPlayer(system);
	}

	createTextAsset(id: string, assetPath: string): g.TextAssetLike {
		return new NodeTextAsset(id, assetPath);
	}

	createScriptAsset(id: string, assetPath: string): g.ScriptAssetLike {
		return new NodeScriptAsset(id, assetPath, this.errorHandler);
	}

	createSurface(width: number, height: number): g.SurfaceLike {
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
	): g.GlyphFactoryLike {
		return new NullGlyphFactory(fontFamily, fontSize, baselineHeight, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight);
	}

	createSurfaceAtlas(width: number, height: number): g.SurfaceAtlasLike {
		return new NullSurfaceAtlas(this.createSurface(width, height));
	}
}
