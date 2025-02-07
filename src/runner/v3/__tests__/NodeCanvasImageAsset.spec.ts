import * as path from "path";
import { Canvas, loadImage } from "canvas";
import * as pixelmatch from "pixelmatch";
import type { RunnerRenderingMode } from "../../types";
import { NodeCanvasFactory } from "../platform/NodeCanvasFactory";
import { createImageAsset } from "./helpers/createImageAsset";

const aksImagePath = path.join(__dirname, "fixtures", "akashic.png");

describe.each(["canvas", "canvas_napi"] satisfies RunnerRenderingMode[])("CanvasImageAsset: renderingMode: %s", (renderingMode) => {
	const canvasFactory = new NodeCanvasFactory(renderingMode);

	it("asSurface()", async () => {
		const expectedImage = await loadImage(aksImagePath);
		const expectedCanvas = new Canvas(expectedImage.width, expectedImage.height);
		const expectedContext = expectedCanvas.getContext("2d");
		expectedContext.drawImage(expectedImage, 0, 0);

		const actualImageAsset = await createImageAsset(canvasFactory, aksImagePath);
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
