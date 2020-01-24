import { akashicEngine as g } from "@akashic/engine-files";
import { NullSurface } from "../NullSurface";
import { Asset } from "./Asset";

export class NullImageAsset extends Asset implements g.ImageAssetLike {
	type: "image" = "image";
	width: number;
	height: number;
	hint: g.ImageAssetHint;

	_surface: g.SurfaceLike = null;

	constructor(id: string, assetPath: string, width: number, height: number) {
		super(id, assetPath);
		this.width = width;
		this.height = height;
	}

	_load(loader: g.AssetLoadHandler): void {
		loader._onAssetLoad(this);
	}

	asSurface(): g.SurfaceLike {
		return this._surface || (this._surface = new NullSurface(this.width, this.height, null));
	}

	initialize(hint: g.ImageAssetHint): void {
		this.hint = hint;
	}
}
