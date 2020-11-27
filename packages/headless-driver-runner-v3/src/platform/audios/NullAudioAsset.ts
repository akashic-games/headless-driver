import { akashicEngine as g } from "@akashic/engine-files";
import { Asset } from "../assets/Asset";

export class NullAudioAsset extends Asset implements g.AudioAsset {
	type: "audio" = "audio";
	data: any;
	duration: number;
	loop: boolean;
	hint: g.AudioAssetHint;
	_system: g.AudioSystem;

	constructor(id: string, assetPath: string, duration: number, system: g.AudioSystem, loop: boolean, hint: g.AudioAssetHint) {
		super(id, assetPath);
		this.duration = duration;
		this.loop = loop;
		this.hint = hint;
		this._system = system;
		this.data = undefined;
	}

	_load(loader: g.AssetLoadHandler): void {
		loader._onAssetLoad(this);
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
