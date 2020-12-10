import { akashicEngine as g } from "@akashic/engine-files";
import { loadFileInSandbox } from "@akashic/headless-driver-runner";
import { Asset } from "./Asset";

export class NodeTextAsset extends Asset implements g.TextAsset {
	type: "text" = "text";
	data: string = "";

	_load(loader: g.AssetLoadHandler): void {
		loadFileInSandbox<string>(this.path, { json: false })
			.then((text) => {
				this.data = text;
				return loader._onAssetLoad(this);
			})
			.catch((e) => loader._onAssetError(this, e));
	}
}
