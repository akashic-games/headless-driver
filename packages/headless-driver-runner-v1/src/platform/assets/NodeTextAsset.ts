import { akashicEngine as g } from "@akashic/engine-files";
import { loadFileInVm } from "@akashic/headless-driver-runner";

export class NodeTextAsset extends g.TextAsset {
	_load(loader: g.AssetLoadHandler): void {
		loadFileInVm<string>(this.path, { json: false })
			.then(text => {
				this.data = text;
				return loader._onAssetLoad(this);
			})
			.catch(e => loader._onAssetError(this, e));
	}
}
