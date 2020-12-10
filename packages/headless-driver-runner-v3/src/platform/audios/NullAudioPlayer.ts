import { akashicEngine as g } from "@akashic/engine-files";

export class NullAudioPlayer implements g.AudioPlayer {
	currentAudio: g.AudioAsset | undefined;
	onPlay: g.Trigger<g.AudioPlayerEvent>;
	onStop: g.Trigger<g.AudioPlayerEvent>;
	played: g.Trigger<g.AudioPlayerEvent>;
	stopped: g.Trigger<g.AudioPlayerEvent>;
	volume: number;
	_muted: boolean;

	constructor(system: g.AudioSystem) {
		this.onPlay = new g.Trigger<g.AudioPlayerEvent>();
		this.onStop = new g.Trigger<g.AudioPlayerEvent>();
		this.played = this.onPlay;
		this.stopped = this.onStop;
		this.currentAudio = undefined;
		this.volume = system.volume;
		this._muted = system._muted;
	}

	play(audio: g.AudioAsset): void {
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
