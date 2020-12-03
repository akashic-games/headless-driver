import { Canvas, loadImage } from "canvas";
import sizeOf from "image-size";
import * as path from "path";
import * as pixelmatch from "pixelmatch";
import { NodeCanvasImageAsset } from "../platform/graphics/canvas/NodeCanvasImageAsset";

const aksImagePath = path.join(__dirname, "fixtures", "akashic.png");

describe("NodeCanvasImageAsset", () => {
	async function createImageAsset(filepath: string): Promise<NodeCanvasImageAsset> {
		return new Promise((resolve, reject) => {
			const filename = path.basename(filepath);
			const { width, height } = sizeOf(filepath);
			const asset = new NodeCanvasImageAsset(filename, filepath, width!, height!);
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

	it("asSurface()", async () => {
		const expectedImage = await loadImage(aksImagePath);
		const expectedCanvas = new Canvas(expectedImage.width, expectedImage.height);
		const expectedContext = expectedCanvas.getContext("2d");
		expectedContext.drawImage(expectedImage, 0, 0);

		const actualImageAsset = await createImageAsset(aksImagePath);
		const actualSurface = actualImageAsset.asSurface();

		expect(expectedImage.width).toBe(actualSurface.width);
		expect(expectedImage.height).toBe(actualSurface.height);

		const missingPixels = pixelmatch(
			expectedContext.getImageData(0, 0, expectedImage.width, expectedImage.height).data,
			actualSurface._drawable.getContext("2d").getImageData(0, 0, actualSurface.width, actualSurface.height).data,
			null,
			expectedImage.width,
			expectedImage.height
		);

		expect(missingPixels).toBe(0);
	});
});
