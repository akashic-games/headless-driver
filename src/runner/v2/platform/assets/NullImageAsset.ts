import { akashicEngine as g } from "engine-files-v2";
import { NullSurface } from "../NullSurface";

export class NullImageAsset extends g.ImageAsset {
	_surface: g.Surface | null = null;

	_load(loader: g.AssetLoadHandler): void {
		setTimeout(() => {
			loader._onAssetLoad(this);
		}, 0);
	}

	asSurface(): g.Surface {
		return this._surface || (this._surface = new NullSurface(this.width, this.height, null));
	}
}
