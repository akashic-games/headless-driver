import { akashicEngine as g } from "@akashic/engine-files";
import { loadFile } from "@akashic/headless-driver-runner";

export class NodeTextAsset extends g.TextAsset {
	_load(loader: g.AssetLoadHandler): void {
		loadFile<string>(this.path, {json: false})
			.then(text => {
				this.data = text;
				return loader._onAssetLoad(this);
			})
			.catch(e => loader._onAssetError(this, e));
	}
}
