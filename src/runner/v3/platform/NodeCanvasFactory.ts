import type { RunnerRenderingMode } from "../../types";
import type { Canvas, Image } from "./graphics/canvas/types";

export class NodeCanvasFactory {
	renderingMode: RunnerRenderingMode;
	module: any;

	constructor(renderingMode: RunnerRenderingMode) {
		this.renderingMode = renderingMode;

		// NOTE: このファイルの require() 時点で不要な依存モジュールを読み込ませないよう、動的に require() する。
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		this.module = require(this.renderingMode === "canvas" ? "canvas" : "@napi-rs/canvas");
	}

	createCanvas(width: number, height: number): Canvas {
		return this.module.createCanvas(width, height);
	}

	createImage(): Image {
		// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
