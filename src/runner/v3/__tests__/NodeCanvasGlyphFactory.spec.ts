import * as fs from "fs";
import * as path from "path";
import type { RunnerRenderingMode } from "../../types";
import { NodeCanvasGlyphFactory } from "../platform/graphics/canvas/NodeCanvasGlyphFactory";
import { NodeCanvasSurface } from "../platform/graphics/canvas/NodeCanvasSurface";
import { NodeCanvasFactory } from "../platform/NodeCanvasFactory";

const outputPath = path.join(__dirname, "out");

describe.each(["canvas", "@napi-rs/canvas"] satisfies RunnerRenderingMode[])("CanvasGlyphFactory: renderingMode: %s", (renderingMode) => {
	const canvasFactory = new NodeCanvasFactory(renderingMode);
	const renderingName = renderingMode === "canvas" ? "canvas" : "napi";

	if (renderingMode === "@napi-rs/canvas") {
		// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/naming-convention
		const { GlobalFonts } = require("@napi-rs/canvas");
		GlobalFonts.registerFromPath(path.join(__dirname, "fixtures", "fonts", "NotoSansJP-Regular.ttf"), "sans-serif");
		GlobalFonts.registerFromPath(path.join(__dirname, "fixtures", "fonts", "NotoSerifJP-Regular.ttf"), "serif");
		GlobalFonts.registerFromPath(path.join(__dirname, "fixtures", "fonts", "MPLUS1Code-Regular.ttf"), "monospace");
	}

	function drawChars(canvasFactory: NodeCanvasFactory, chars: string, fontFamily: string, output: string): void {
		const glyphFactory = new NodeCanvasGlyphFactory(canvasFactory, fontFamily, 30, 30, "white", 0, "black", false, "normal");

		const outputSurface = new NodeCanvasSurface(canvasFactory.createCanvas(2048, 2048));
		const outputRenderer = outputSurface.renderer();

		outputRenderer.begin();

		let offsetX = 0;
		let offsetY = 0;
		let maxLineHeight = 0;

		for (let i = 0; i < chars.length; i++) {
			const glyph = glyphFactory.create(chars[i].charCodeAt(0));
			if (outputSurface.width < offsetX + glyph.width) {
				offsetX = 0;
				offsetY += maxLineHeight;
				maxLineHeight = 0;
			}
			if (maxLineHeight < glyph.height) {
				maxLineHeight = glyph.height;
			}

			// @ts-ignore
			outputRenderer.drawImage(glyph.surface, 0, 0, glyph.surface.width, glyph.surface.height, offsetX, offsetY);
			offsetX += glyph.advanceWidth;
		}

		outputRenderer.end();

		fs.writeFileSync(output, outputSurface._drawable.toBuffer("image/png"));
	}

	it("rendering - JIS第1水準", async () => {
		drawChars(
			canvasFactory,
			fs.readFileSync(path.join(__dirname, "fixtures", "chars_jis_level_1.txt"), { encoding: "utf8" }),
			"sans-serif",
			path.join(outputPath, `glyph_factory_test_01_${renderingName}_jis_level_1_sans-serif.png`)
		);
		drawChars(
			canvasFactory,
			fs.readFileSync(path.join(__dirname, "fixtures", "chars_jis_level_1.txt"), { encoding: "utf8" }),
			"serif",
			path.join(outputPath, `glyph_factory_test_01_${renderingName}_jis_level_1_serif.png`)
		);
		drawChars(
			canvasFactory,
			fs.readFileSync(path.join(__dirname, "fixtures", "chars_jis_level_1.txt"), { encoding: "utf8" }),
			"monospace",
			path.join(outputPath, `glyph_factory_test_01_${renderingName}_jis_level_1_monospace.png`)
		);
	});

	it("rendering - ひらがな・カタカナ", () => {
		drawChars(
			canvasFactory,
			fs.readFileSync(path.join(__dirname, "fixtures", "chars_katakana_hiragana.txt"), { encoding: "utf8" }),
			"sans-serif",
			path.join(outputPath, `glyph_factory_test_01_${renderingName}_chars_katakana_hiragana_sans-serif.png`)
		);
		drawChars(
			canvasFactory,
			fs.readFileSync(path.join(__dirname, "fixtures", "chars_katakana_hiragana.txt"), { encoding: "utf8" }),
			"serif",
			path.join(outputPath, `glyph_factory_test_01_${renderingName}_chars_katakana_hiragana_serif.png`)
		);
		drawChars(
			canvasFactory,
			fs.readFileSync(path.join(__dirname, "fixtures", "chars_katakana_hiragana.txt"), { encoding: "utf8" }),
			"monospace",
			path.join(outputPath, `glyph_factory_test_01_${renderingName}_chars_katakana_hiragana_monospace.png`)
		);
	});

	it("rendering - ASCII", () => {
		drawChars(
			canvasFactory,
			fs.readFileSync(path.join(__dirname, "fixtures", "chars_ascii.txt"), { encoding: "utf8" }),
			"sans-serif",
			path.join(outputPath, `glyph_factory_test_01_${renderingName}_chars_ascii_sans-serif.png`)
		);
		drawChars(
			canvasFactory,
			fs.readFileSync(path.join(__dirname, "fixtures", "chars_ascii.txt"), { encoding: "utf8" }),
			"serif",
			path.join(outputPath, `glyph_factory_test_01_${renderingName}_chars_ascii_serif.png`)
		);
		drawChars(
			canvasFactory,
			fs.readFileSync(path.join(__dirname, "fixtures", "chars_ascii.txt"), { encoding: "utf8" }),
			"monospace",
			path.join(outputPath, `glyph_factory_test_01_${renderingName}_chars_ascii_monospace.png`)
		);
	});
});
