import * as path from "path";
import sizeOf from "image-size";
import { NodeCanvasImageAsset } from "../../platform/graphics/canvas/NodeCanvasImageAsset";
import type { NodeCanvasFactory } from "../../platform/NodeCanvasFactory";

export async function createImageAsset(canvasFactory: NodeCanvasFactory, filepath: string): Promise<NodeCanvasImageAsset> {
	return new Promise((resolve, reject) => {
		const filename = path.basename(filepath);
		const { width, height } = sizeOf(filepath);
		const asset = new NodeCanvasImageAsset({ id: filename, path: filepath, width: width!, height: height!, canvasFactory });
		asset.initialize({});
		asset._load({
			_onAssetError(_asset: NodeCanvasImageAsset, error: Error): void {
				reject(error);
			},
			_onAssetLoad(a: NodeCanvasImageAsset): void {
				resolve(a);
			}
		});
	});
}
