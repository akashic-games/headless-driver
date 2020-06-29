import { akashicEngine as g } from "@akashic/engine-files";
import { NullSurface } from "../NullSurface";
import { NullVideoPlayer } from "../NullVideoPlayer";
import { Asset } from "./Asset";

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

	stop(): void {
		//
	}
}
