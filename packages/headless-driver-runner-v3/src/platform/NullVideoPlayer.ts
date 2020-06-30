import { akashicEngine as g } from "@akashic/engine-files";

export class NullVideoPlayer implements g.VideoPlayer {
	currentVideo: g.VideoAsset;
	onPlay: g.Trigger<g.VideoPlayerEvent>;
	onStop: g.Trigger<g.VideoPlayerEvent>;
	played: g.Trigger<g.VideoPlayerEvent>;
	stopped: g.Trigger<g.VideoPlayerEvent>;
	volume: number;
	_loop: boolean;

	constructor(loop?: boolean) {
		this._loop = !!loop;
		this.onPlay = new g.Trigger<g.VideoPlayerEvent>();
		this.onStop = new g.Trigger<g.VideoPlayerEvent>();
		this.played = this.onPlay;
		this.stopped = this.onStop;
		this.currentVideo = undefined;
		this.volume = 1.0;
	}

	play(videoAsset: g.VideoAsset): void {
		this.currentVideo = videoAsset;
	}

	stop(): void {
		//
	}

	changeVolume(volume: number): void {
		this.volume = volume;
	}
}
