import { akashicEngine as g } from "@akashic/engine-files";

export class NullAudioAsset extends g.AudioAsset {
	_load(loader: g.AssetLoadHandler): void {
		loader._onAssetLoad(this);
	}
}
