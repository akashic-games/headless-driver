import { akashicEngine as g } from "engine-files-v1";

export class NullAudioAsset extends g.AudioAsset {
	_load(loader: g.AssetLoadHandler): void {
		// アセットのロードは原則非同期としたいのでsetTimeoutを使用
		setTimeout(() => {
			loader._onAssetLoad(this);
		}, 0);
	}
}
