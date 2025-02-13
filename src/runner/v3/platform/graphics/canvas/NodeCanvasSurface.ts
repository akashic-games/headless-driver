import type { akashicEngine as g } from "../../../engineFiles";
import { NodeCanvasContext } from "./NodeCanvasContext";
import { NodeCanvasRenderer } from "./NodeCanvasRenderer";
import type { Canvas } from "./types";

export class NodeCanvasSurface implements g.Surface {
	width: number;
	height: number;
	_drawable: Canvas;
	_renderer: NodeCanvasRenderer;

	constructor(canvas: Canvas) {
		this.width = canvas.width;
		this.height = canvas.height;
		this._drawable = canvas;
		const context = new NodeCanvasContext(canvas.getContext("2d"));
		this._renderer = new NodeCanvasRenderer(context, canvas.width, canvas.height);
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
