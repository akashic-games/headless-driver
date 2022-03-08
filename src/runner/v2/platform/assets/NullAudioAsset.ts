import { akashicEngine as g } from "aev2";

export class NullAudioAsset extends g.AudioAsset {
	_load(loader: g.AssetLoadHandler): void {
		loader._onAssetLoad(this);
	}
}
