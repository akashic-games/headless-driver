import { akashicEngine as g } from "engine-files-v2";

export class NullAudioAsset extends g.AudioAsset {
	_load(loader: g.AssetLoadHandler): void {
		setImmediate(() => {
			loader._onAssetLoad(this);
		});
	}
}
