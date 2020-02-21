import { akashicEngine as g } from "@akashic/engine-files";

export class NullAudioPlayer implements g.AudioPlayerLike {
	currentAudio: g.AudioAssetLike;
	played: g.Trigger<g.AudioPlayerEvent>;
	stopped: g.Trigger<g.AudioPlayerEvent>;
	volume: number;
	_muted: boolean;

	constructor(system: g.AudioSystemLike) {
		this.played = new g.Trigger<g.AudioPlayerEvent>();
		this.stopped = new g.Trigger<g.AudioPlayerEvent>();
		this.currentAudio = undefined;
		this.volume = system.volume;
		this._muted = system._muted;
	}

	play(audio: g.AudioAssetLike): void {
		this.currentAudio = audio;
	}

	stop(): void {
		//
	}

	canHandleStopped(): boolean {
		return true;
	}

	changeVolume(volume: number): void {
		this.volume = volume;
	}

	_changeMuted(muted: boolean): void {
		this._muted = muted;
	}

	_notifyVolumeChanged(): void {
		//
	}
}
