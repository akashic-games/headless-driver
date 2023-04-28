import type { akashicEngine as g } from "../../engineFiles";
import { Asset } from "../assets/Asset";
import { NullSurface } from "../graphics/null/NullSurface";
import { NullVideoPlayer } from "./NullVideoPlayer";

export class NullVideoAsset extends Asset implements g.VideoAsset {
	type: "video" = "video";
	width: number;
	height: number;
	realWidth: number;
	realHeight: number;
	_system: g.VideoSystem;
	_loop: boolean;
	_useRealSize: boolean;

	_surface: g.Surface | null = null;
	_player: g.VideoPlayer;

	constructor(id: string, assetPath: string, width: number, height: number, system: any, loop: boolean, useRealSize: boolean) {
		super(id, assetPath);
		this.width = width;
		this.height = height;
		this.realWidth = 0;
		this.realHeight = 0;
		this._system = system;
		this._loop = loop;
		this._useRealSize = useRealSize;
		this._player = new NullVideoPlayer();
	}

	_load(loader: g.AssetLoadHandler): void {
		// アセットのロードは原則非同期としたいのでsetTimeoutを使用
		setTimeout(() => {
			loader._onAssetLoad(this);
		}, 0);
	}

	asSurface(): g.Surface {
		return this._surface || (this._surface = new NullSurface(this.width, this.height));
	}

	getPlayer(): g.VideoPlayer {
		return this._player;
	}

	play(): g.VideoPlayer {
		return this._player;
	}

	stop(): void {
		// do nothing
	}
}
