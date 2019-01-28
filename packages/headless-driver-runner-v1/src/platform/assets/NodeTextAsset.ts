import { akashicEngine as g } from "@akashic/engine-files";
import fetch from "node-fetch";

export class NodeTextAsset extends g.TextAsset {
	_load(loader: g.AssetLoadHandler): void {
		fetch(this.path, { method: "GET" })
			.then(res => res.text())
			.then(text => {
				this.data = text;
				return loader._onAssetLoad(this);
			})
			.catch(e => loader._onAssetError(this, e));
	}
}
