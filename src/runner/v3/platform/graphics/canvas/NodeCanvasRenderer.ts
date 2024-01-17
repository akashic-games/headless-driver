/** @ts-ignore */
import type { ImageData } from "canvas";
import type { akashicEngine as g } from "../../../engineFiles";
import { CompositeOperationConverter } from "./CompositeOperationConverter";
import type { NodeCanvasContext } from "./NodeCanvasContext";

export class NodeCanvasRenderer implements g.Renderer {
	private context: NodeCanvasContext;
	private width: number;
	private height: number;

	constructor(context: NodeCanvasContext, width: number, height: number) {
		this.context = context;
		this.width = width;
		this.height = height;
	}

	begin(): void {
		// do nothing
	}

	drawSprites(): void {
		// do nothing
	}

	clear(): void {
		this.context.clearRect(0, 0, this.width, this.height);
	}

	end(): void {
		// do nothing
	}

	drawImage(
		surface: g.Surface,
		offsetX: number,
		offsetY: number,
		width: number,
		height: number,
		canvasOffsetX: number,
		canvasOffsetY: number
	): void {
		this.context.drawImage(surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, width, height);
	}

	translate(x: number, y: number): void {
		this.context.translate(x, y);
	}

	transform(matrix: number[]): void {
		// @ts-ignore 高速化のため型チェックを無効
		this.context.transform.apply(this.context, matrix);
	}

	opacity(opacity: number): void {
		// NOTE: globalAlphaの初期値が1であることは仕様上保証されているため、常に掛け合わせる
		this.context.globalAlpha *= opacity;
	}

	save(): void {
		this.context.save();
	}

	restore(): void {
		this.context.restore();
	}

	fillRect(x: number, y: number, width: number, height: number, cssColor: string): void {
		const _fillStyle = this.context.fillStyle;
		this.context.fillStyle = cssColor;
		this.context.fillRect(x, y, width, height);
		this.context.fillStyle = _fillStyle;
	}

	setCompositeOperation(operation: g.CompositeOperationString): void {
		this.context.globalCompositeOperation = CompositeOperationConverter.toContext2D(operation);
	}

	setOpacity(opacity: number): void {
		this.context.globalAlpha = opacity;
	}

	setTransform(matrix: number[]): void {
		// @ts-ignore 高速化のため型チェックを無効
		this.context.setTransform.apply(this.context, matrix);
	}

	setShaderProgram(_shaderProgram: g.ShaderProgram | null): void {
		// do nothing
	}

	isSupportedShaderProgram(): boolean {
		return false;
	}

	_getImageData(sx: number, sy: number, sw: number, sh: number): g.ImageData | null {
		return this.context.getImageData(sx, sy, sw, sh);
	}

	_putImageData(
		imageData: ImageData,
		dx: number,
		dy: number,
		dirtyX: number = 0,
		dirtyY: number = 0,
		dirtyWidth: number = imageData.width,
		dirtyHeight: number = imageData.height
	): void {
		this.context.putImageData(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
	}
}
