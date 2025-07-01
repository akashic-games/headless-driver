import type { RunnerRenderingMode } from "../../types";
import type { Canvas, Image } from "./graphics/canvas/types";

interface CanvasCompatibilityModule {
	createCanvas(width: number, height: number): Canvas;
	Image: typeof Image;
}

export class NodeCanvasFactory {
	renderingMode: RunnerRenderingMode;
	private module: CanvasCompatibilityModule;

	constructor(renderingMode: RunnerRenderingMode) {
		this.renderingMode = renderingMode;

		// NOTE: このファイルの require() 時点で不要な依存モジュールを読み込ませないよう、動的に require() する。
		// "canvas" と "@napi-rs/canvas" は (このライブラリで使う部分では) API が互換なのでそのまま流用している。
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		this.module = require(this.renderingMode === "canvas" ? "canvas" : "@napi-rs/canvas");
	}

	createCanvas(width: number, height: number): Canvas {
		return this.module.createCanvas(width, height);
	}

	createImage(): Image {
		return new this.module.Image();
	}

	_loadImage(filepath: string): Promise<Image> {
		return new Promise((resolve, reject) => {
			const img = this.createImage();
			img.onload = () => {
				resolve(img);
			};
			img.onerror = (err) => {
				reject(err);
			};
			img.src = filepath;
		});
	}
}
