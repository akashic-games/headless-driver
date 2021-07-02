import { akashicEngine as g } from "../../engineFiles";
import { NullSurface } from "../NullSurface";

export class NullImageAsset extends g.ImageAsset {
	_surface: g.Surface | null = null;

	_load(loader: g.AssetLoadHandler): void {
		loader._onAssetLoad(this);
	}

	asSurface(): g.Surface {
		return this._surface || (this._surface = new NullSurface(this.width, this.height, null));
	}
}
