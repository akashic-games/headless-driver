import * as fs from "fs";
import * as path from "path";
import * as pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import type { RunnerRenderingMode } from "../../types";
import type { CompositeOperation } from "../platform/graphics/canvas/CompositeOperationConverter";
import { CompositeOperationConverter } from "../platform/graphics/canvas/CompositeOperationConverter";
import { NodeCanvasSurface } from "../platform/graphics/canvas/NodeCanvasSurface";
import { NodeCanvasFactory } from "../platform/NodeCanvasFactory";
import { createImageAsset } from "./helpers/createImageAsset";

const aksImagePath = path.join(__dirname, "fixtures", "akashic.png");
const outputPath = path.join(__dirname, "out");

describe.each(["canvas", "canvas_napi"] satisfies RunnerRenderingMode[])("CanvasRenderer: renderingMode: %s", (renderingMode) => {
	const canvasFactory = new NodeCanvasFactory(renderingMode);

	it("rendering - CanvasRenderer's implementation should be the same as node-canvas'", async () => {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const expectedCanvas = require("canvas").createCanvas(800, 800);
		const expectedContext = expectedCanvas.getContext("2d");
		const outputSurface = new NodeCanvasSurface(canvasFactory.createCanvas(800, 800));
		const outputRenderer = outputSurface.renderer();
		const diff = new PNG({ width: 800, height: 800 });

		expectedContext.save();
		outputRenderer.begin();
		outputRenderer.save();

		// 1. translate
		expectedContext.translate(100, 20);
		outputRenderer.translate(100, 20);

		// 2. opacity
		expectedContext.globalAlpha = 0.6;
		outputRenderer.setOpacity(0.6);

		expectedContext.save();
		outputRenderer.save();

		// 3. transform
		expectedContext.transform(1, 0.2, 0.8, 1, 0, 0);
		outputRenderer.transform([1, 0.2, 0.8, 1, 0, 0]);

		// 4. filledRect
		expectedContext.fillStyle = "#999";
		expectedContext.fillRect(50, 50, 100, 100);
		outputRenderer.fillRect(50, 50, 100, 100, "#999");

		// 5. composite
		expectedContext.globalCompositeOperation = "source-atop";
		outputRenderer.setCompositeOperation("source-atop");

		expectedContext.fillStyle = "red";
		expectedContext.fillRect(100, 100, 100, 100);
		outputRenderer.fillRect(100, 100, 100, 100, "red");

		expectedContext.restore();
		outputRenderer.restore();

		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const img = await require("canvas").loadImage(aksImagePath);
		expectedContext.drawImage(img, 20, 20, 80, 80, 10, 300, 80, 80);

		const asset = await createImageAsset(canvasFactory, aksImagePath);

		outputRenderer.drawImage(asset.asSurface(), 20, 20, 80, 80, 10, 300);

		outputRenderer.end();

		const missingPixels = pixelmatch(
			expectedContext.getImageData(0, 0, 800, 800).data,
			outputSurface._drawable.getContext("2d").getImageData(0, 0, 800, 800).data,
			diff.data,
			800,
			800,
			{
				threshold: 0.1
			}
		);

		expect(missingPixels).toBe(0);

		const renderingName = renderingMode === "canvas" ? "canvas" : "napi";
		fs.writeFileSync(path.join(outputPath, `rendering_test_01_${renderingName}_expected.png`), expectedCanvas.toBuffer("image/png"));
		fs.writeFileSync(
			path.join(outputPath, `rendering_test_01_${renderingName}_actual.png`),
			outputSurface._drawable.toBuffer("image/png")
		);
		fs.writeFileSync(path.join(outputPath, `rendering_test_01_${renderingName}_diff.png`), PNG.sync.write(diff));
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

		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const expectedCanvas = require("canvas").createCanvas(800, 800);
		const expectedContext = expectedCanvas.getContext("2d");
		const outputSurface = new NodeCanvasSurface(canvasFactory.createCanvas(800, 800));
		const outputRenderer = outputSurface.renderer();

		for (let i = 0; i < ops.length; i++) {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const canvas = require("canvas").createCanvas(200, 200);
			const context = canvas.getContext("2d");
			const surface = new NodeCanvasSurface(canvasFactory.createCanvas(200, 200));
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

			expectedContext.drawImage(canvas, 0, 0, 200, 200, offsetX, offsetY, 200, 200);
			outputRenderer.drawImage(surface, 0, 0, 200, 200, offsetX, offsetY);
		}

		const renderingName = renderingMode === "canvas" ? "canvas" : "napi";
		fs.writeFileSync(
			path.join(outputPath, `rendering_test_02_${renderingName}_composite_expected.png`),
			expectedCanvas.toBuffer("image/png")
		);
		fs.writeFileSync(
			path.join(outputPath, `rendering_test_02_${renderingName}_composite_actual.png`),
			outputSurface._drawable.toBuffer("image/png")
		);
	});

	it("rendering - does not break even when rendered at scale 0", async () => {
		const surface = new NodeCanvasSurface(canvasFactory.createCanvas(800, 800));
		const renderer = surface.renderer();

		renderer.begin();

		{
			renderer.save();
			renderer.transform([2, 0, 0, 2, 0, 0]);
			renderer.transform([1, 0, 0, 0, 0, 0]);
			renderer.fillRect(100, 100, 100, 100, "red");
			renderer.restore();
		}

		{
			renderer.save();
			const asset = await createImageAsset(canvasFactory, aksImagePath);
			renderer.setTransform([0, 0, 0, 1, 0, 0]);
			renderer.drawImage(asset.asSurface(), 20, 20, 80, 80, 10, 300);
			renderer.restore();
		}

		{
			renderer.save();
			const asset = await createImageAsset(canvasFactory, aksImagePath);
			renderer.transform([3, 0, 0, 3, 0, 0]);
			// この画像のみ描画される
			renderer.drawImage(asset.asSurface(), 0, 0, 150, 107, 100, 100);
			renderer.restore();
		}

		renderer.end();

		const renderingName = renderingMode === "canvas" ? "canvas" : "napi";
		fs.writeFileSync(path.join(outputPath, `rendering_test_03_${renderingName}_actual.png`), surface._drawable.toBuffer("image/png"));
	});
});
