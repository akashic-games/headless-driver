import { akashicEngine as g } from "@akashic/engine-files";

export class NullAudioAsset extends g.Asset implements g.AudioAssetLike {
	type: "audio" = "audio";
	data: any;
	duration: number;
	loop: boolean;
	hint: g.AudioAssetHint;
	_system: g.AudioSystemLike;

	constructor(id: string, assetPath: string, duration: number, system: g.AudioSystemLike, loop: boolean, hint: g.AudioAssetHint) {
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

	play(): g.AudioPlayerLike {
		return this._system.createPlayer();
	}

	stop(): void {}

	inUse(): boolean {
		return this._system.findPlayers(this).length > 0;
	}
}
