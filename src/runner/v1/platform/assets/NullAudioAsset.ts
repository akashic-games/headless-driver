import { akashicEngine as g } from "engine-files-v1";

export class NullAudioAsset extends g.AudioAsset {
	_load(loader: g.AssetLoadHandler): void {
		setImmediate(() => {
			loader._onAssetLoad(this);
		});
	}
}
