import { akashicEngine as g } from "@akashic/engine-files";
import { Canvas } from "canvas";
import { NodeCanvasRenderer } from "./NodeCanvasRenderer";

export class NodeCanvasSurface implements g.Surface {
	width: number;
	height: number;
	_drawable: Canvas;
	_renderer: NodeCanvasRenderer;

	constructor(canvas: Canvas) {
		this.width = canvas.width;
		this.height = canvas.height;
		this._drawable = canvas;
		this._renderer = new NodeCanvasRenderer(canvas.getContext("2d"), canvas.width, canvas.height);
	}

	renderer(): NodeCanvasRenderer {
		return this._renderer;
	}

	isPlaying(): boolean {
		return false;
	}

	destroy(): void {
		// do nothing
	}

	destroyed(): boolean {
		return this._renderer == null;
	}
}
