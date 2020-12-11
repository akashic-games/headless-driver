import { Canvas, loadImage } from "canvas";
import * as fs from "fs";
import sizeOf from "image-size";
import * as path from "path";
import * as pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { CompositeOperation, CompositeOperationConverter } from "../platform/graphics/canvas/CompositeOperationConverter";
import { NodeCanvasImageAsset } from "../platform/graphics/canvas/NodeCanvasImageAsset";
import { NodeCanvasSurface } from "../platform/graphics/canvas/NodeCanvasSurface";

const aksImagePath = path.join(__dirname, "fixtures", "akashic.png");
const outputPath = path.join(__dirname, "out");

describe("NodeCanvasRenderer", () => {
	async function createImageAsset(filepath: string): Promise<NodeCanvasImageAsset> {
		return new Promise((resolve, reject) => {
			const filename = path.basename(filepath);
			const { width, height } = sizeOf(filepath);
			// @ts-ignore
			const asset = new NodeCanvasImageAsset(filename, filepath, width, height);
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

	it("rendering - should NodeCanvasRenderer's implementation and node-canvas' are the same", async () => {
		const outputCanvas = new Canvas(800, 800);
		const outputContext = outputCanvas.getContext("2d");
		const outputSurface = new NodeCanvasSurface(new Canvas(800, 800));
		const outputRenderer = outputSurface.renderer();
		const diff = new PNG({ width: 800, height: 800 });

		outputContext.save();
		outputRenderer.begin();
		outputRenderer.save();

		// 1. translate
		outputContext.translate(100, 20);
		outputRenderer.translate(100, 20);

		// 2. opacity
		outputContext.globalAlpha = 0.6;
		outputRenderer.setOpacity(0.6);

		outputContext.save();
		outputRenderer.save();

		// 3. transform
		outputContext.transform(1, 0.2, 0.8, 1, 0, 0);
		outputRenderer.transform([1, 0.2, 0.8, 1, 0, 0]);

		// 4. filledRect
		outputContext.fillStyle = "#999";
		outputContext.fillRect(50, 50, 100, 100);
		outputRenderer.fillRect(50, 50, 100, 100, "#999");

		// 5. composite
		outputContext.globalCompositeOperation = "source-atop";
		outputRenderer.setCompositeOperation("source-atop");

		outputContext.fillStyle = "red";
		outputContext.fillRect(100, 100, 100, 100);
		outputRenderer.fillRect(100, 100, 100, 100, "red");

		outputContext.restore();
		outputRenderer.restore();

		const img = await loadImage(aksImagePath);
		outputContext.drawImage(img, 20, 20, 80, 80, 10, 300, 80, 80);

		const asset = await createImageAsset(aksImagePath);
		outputRenderer.drawImage(asset.asSurface(), 20, 20, 80, 80, 10, 300);

		outputRenderer.end();

		const missingPixels = pixelmatch(
			outputContext.getImageData(0, 0, 800, 800).data,
			outputSurface._drawable.getContext("2d").getImageData(0, 0, 800, 800).data,
			diff.data,
			800,
			800,
			{
				threshold: 0.1
			}
		);

		expect(missingPixels).toBe(0);

		fs.writeFileSync(path.join(outputPath, "rendering_test_01_expected.png"), outputCanvas.toBuffer());
		fs.writeFileSync(path.join(outputPath, "rendering_test_01_actual.png"), outputSurface._drawable.toBuffer());
		fs.writeFileSync(path.join(outputPath, "rendering_test_01_diff.png"), PNG.sync.write(diff));
	});

	it("rendering - compares composite operations", () => {
		const ops: CompositeOperation[] = [
			"source-atop",
			"source-over",
			"lighter",
			"copy",
			"source-in",
			"source-out",
			"destination-atop",
			"destination-in",
			"destination-out",
			"destination-over",
			"xor"
		];

		const outputCanvas = new Canvas(800, 800);
		const outputContext = outputCanvas.getContext("2d");
		const outputSurface = new NodeCanvasSurface(new Canvas(800, 800));
		const outputRenderer = outputSurface.renderer();

		for (let i = 0; i < ops.length; i++) {
			const canvas = new Canvas(200, 200);
			const context = canvas.getContext("2d");
			const surface = new NodeCanvasSurface(new Canvas(200, 200));
			const renderer = surface.renderer();

			const compositeOperation = ops[i];
			const offsetX = (i % 4) * 200;
			const offsetY = Math.floor(i / 4) * 200;

			renderer.begin();

			{
				context.save();
				renderer.save();

				context.fillStyle = "red";
				context.fillRect(10, 10, 100, 100);
				renderer.fillRect(10, 10, 100, 100, "red");

				context.globalCompositeOperation = compositeOperation;
				renderer.setCompositeOperation(CompositeOperationConverter.toEngine(compositeOperation));

				context.fillStyle = "blue";
				context.fillRect(60, 60, 100, 100);
				renderer.fillRect(60, 60, 100, 100, "blue");

				context.restore();
				renderer.restore();
			}

			// add a caption
			[context, surface._drawable.getContext("2d")].forEach((c) => {
				c.save();
				c.globalCompositeOperation = "source-over";
				c.strokeStyle = "black";
				c.fillStyle = "white";
				c.font = "18px sans-serif";
				c.textAlign = "center";
				c.fillText(compositeOperation, 200 / 2, 200 - 5, 200);
				c.strokeText(compositeOperation, 200 / 2, 200 - 5, 200);
				c.restore();
			});

			renderer.end();

			outputContext.drawImage(canvas, 0, 0, 200, 200, offsetX, offsetY, 200, 200);
			outputRenderer.drawImage(surface, 0, 0, 200, 200, offsetX, offsetY);
		}

		fs.writeFileSync(path.join(outputPath, `rendering_test_02_composite_expected.png`), outputCanvas.toBuffer());
		fs.writeFileSync(path.join(outputPath, `rendering_test_02_composite_actual.png`), outputSurface._drawable.toBuffer());
	});
});
