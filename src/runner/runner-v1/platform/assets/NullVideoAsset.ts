import { akashicEngine as g } from "../../engineFiles";
import { NullSurface } from "../NullSurface";

export class NullVideoAsset extends g.VideoAsset {
	_surface: g.Surface | null = null;
	_player: g.VideoPlayer;

	constructor(id: string, assetPath: string, width: number, height: number, system: any, loop: boolean, useRealSize: boolean) {
		super(id, assetPath, width, height, system, loop, useRealSize);
		this._player = new g.VideoPlayer();
	}

	_load(loader: g.AssetLoadHandler): void {
		loader._onAssetLoad(this);
	}

	asSurface(): g.Surface {
		return this._surface || (this._surface = new NullSurface(this.width, this.height, null));
	}

	getPlayer(): g.VideoPlayer {
		return this._player;
	}

	play(): g.VideoPlayer {
		return this._player;
	}
}
