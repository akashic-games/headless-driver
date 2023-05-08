import type { akashicEngine as g } from "../../engineFiles";
import { Asset } from "../assets/Asset";

export class NullAudioAsset extends Asset implements g.AudioAsset {
	type: "audio" = "audio";
	data: any;
	duration: number;
	loop: boolean;
	hint: g.AudioAssetHint;
	_system: g.AudioSystem;
	offset: number;

	constructor(
		id: string,
		assetPath: string,
		duration: number,
		system: g.AudioSystem,
		loop: boolean,
		hint: g.AudioAssetHint,
		offset: number
	) {
		super(id, assetPath);
		this.duration = duration;
		this.loop = loop;
		this.hint = hint;
		this._system = system;
		this.offset = offset;
		this.data = undefined;
	}

	_load(loader: g.AssetLoadHandler): void {
		setTimeout(() => {
			loader._onAssetLoad(this);
		}, 0);
	}

	play(): g.AudioPlayer {
		return this._system.createPlayer();
	}

	stop(): void {
		//
	}

	inUse(): boolean {
		return this._system.findPlayers(this).length > 0;
	}
}
