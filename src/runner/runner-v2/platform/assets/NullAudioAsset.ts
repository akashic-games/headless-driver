import { akashicEngine as g } from "../../engineFiles";

export class NullAudioAsset extends g.AudioAsset {
	_load(loader: g.AssetLoadHandler): void {
		loader._onAssetLoad(this);
	}
}
