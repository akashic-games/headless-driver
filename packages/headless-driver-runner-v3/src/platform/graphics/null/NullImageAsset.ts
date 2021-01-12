import { akashicEngine as g } from "@akashic/engine-files";
import { Asset } from "../../assets/Asset";
import { NullSurface } from "./NullSurface";

export class NullImageAsset extends Asset implements g.ImageAsset {
	type: "image" = "image";
	width: number;
	height: number;
	hint: g.ImageAssetHint | undefined;

	_surface: g.Surface | null = null;

	constructor(id: string, assetPath: string, width: number, height: number) {
		super(id, assetPath);
		this.width = width;
		this.height = height;
	}

	_load(loader: g.AssetLoadHandler): void {
		loader._onAssetLoad(this);
	}

	asSurface(): g.Surface {
		return this._surface || (this._surface = new NullSurface(this.width, this.height));
	}

	initialize(hint: g.ImageAssetHint): void {
		this.hint = hint;
	}
}
