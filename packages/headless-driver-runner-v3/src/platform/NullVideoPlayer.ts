import { akashicEngine as g } from "@akashic/engine-files";

export class NullVideoPlayer implements g.VideoPlayerLike {
	currentVideo: g.VideoAssetLike;
	played: g.Trigger<g.VideoPlayerEvent>;
	stopped: g.Trigger<g.VideoPlayerEvent>;
	volume: number;
	_loop: boolean;

	constructor(loop?: boolean) {
		this._loop = !!loop;
		this.played = new g.Trigger<g.VideoPlayerEvent>();
		this.stopped = new g.Trigger<g.VideoPlayerEvent>();
		this.currentVideo = undefined;
		this.volume = 1.0;
	}

	play(videoAsset: g.VideoAssetLike): void {
		this.currentVideo = videoAsset;
	}

	stop(): void {
		//
	}

	changeVolume(volume: number): void {
		this.volume = volume;
	}
}
