import type { akashicEngine as g } from "../../../engineFiles";
import { RenderingState } from "./RenderingState";
import type { CanvasRenderingContext2D, ImageData, GlobalCompositeOperation } from "./types";

export class NodeCanvasContext {
	protected _context: CanvasRenderingContext2D;
	protected _stateStack: RenderingState[] = [];

	protected _contextFillStyle: string;
	protected _contextGlobalAlpha: number;
	protected _contextGlobalCompositeOperation: string;

	private _modifiedTransform: boolean = false;

	constructor(context: CanvasRenderingContext2D) {
		this._context = context;
		const state = new RenderingState();
		this._contextFillStyle = state.fillStyle;
		this._contextGlobalAlpha = state.globalAlpha;
		this._contextGlobalCompositeOperation = state.globalCompositeOperation;
		this.pushState(state);
	}

	set fillStyle(fillStyle: string) {
		this.currentState().fillStyle = fillStyle;
	}

	get fillStyle(): string {
		return this.currentState().fillStyle;
	}

	set globalAlpha(globalAlpha: number) {
		this.currentState().globalAlpha = globalAlpha;
	}

	get globalAlpha(): number {
		return this.currentState().globalAlpha;
	}

	set globalCompositeOperation(operation: string) {
		this.currentState().globalCompositeOperation = operation;
	}

	get globalCompositeOperation(): string {
		return this.currentState().globalCompositeOperation;
	}

	getCanvasRenderingContext2D(): CanvasRenderingContext2D {
		return this._context;
	}

	clearRect(x: number, y: number, width: number, height: number): void {
		this.prerender();
		this._context.clearRect(x, y, width, height);
	}

	save(): void {
		const state = new RenderingState(this.currentState());
		this.pushState(state);
	}

	restore(): void {
		this.popState();
	}

	scale(x: number, y: number): void {
		this.currentState().transformer.scale(x, y);
		this._modifiedTransform = true;
	}

	drawImage(
		surface: g.Surface,
		srcX: number,
		srcY: number,
		srcW: number,
		srcH: number,
		dstX: number,
		dstY: number,
		dstW: number,
		dstH: number
	): void {
		if (this.prerender()) {
			this._context.drawImage(surface._drawable, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
		}
	}

	fillRect(x: number, y: number, width: number, height: number): void {
		if (this.prerender()) {
			this._context.fillRect(x, y, width, height);
		}
	}

	fillText(text: string, x: number, y: number, maxWidth: number): void {
		if (this.prerender()) {
			this._context.fillText(text, x, y, maxWidth);
		}
	}

	strokeText(text: string, x: number, y: number, maxWidth?: number): void {
		if (this.prerender()) {
			this._context.strokeText(text, x, y, maxWidth);
		}
	}

	translate(x: number, y: number): void {
		this.currentState().transformer.translate(x, y);
		this._modifiedTransform = true;
	}

	transform(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number): void {
		this.currentState().transformer.transform([m11, m12, m21, m22, dx, dy]);
		this._modifiedTransform = true;
	}

	setTransform(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number): void {
		this.currentState().transformer.setTransform([m11, m12, m21, m22, dx, dy]);
		this._modifiedTransform = true;
	}

	setGlobalAlpha(globalAlpha: number): void {
		this.currentState().globalAlpha = globalAlpha;
	}

	getImageData(sx: number, sy: number, sw: number, sh: number): ImageData {
		return this._context.getImageData(sx, sy, sw, sh);
	}

	putImageData(
		imagedata: ImageData,
		dx: number,
		dy: number,
		dirtyX?: number,
		dirtyY?: number,
		dirtyWidth?: number,
		dirtyHeight?: number
	): void {
		this._context.putImageData(imagedata, dx, dy, dirtyX!, dirtyY!, dirtyWidth!, dirtyHeight!);
	}

	/**
	 * 描画の前処理。
	 * 描画を省略すべきであれば false を返す。
	 */
	prerender(): boolean {
		const currentState = this.currentState();

		if (currentState.fillStyle !== this._contextFillStyle) {
			this._context.fillStyle = currentState.fillStyle;
			this._contextFillStyle = currentState.fillStyle;
		}
		if (currentState.globalAlpha !== this._contextGlobalAlpha) {
			this._context.globalAlpha = currentState.globalAlpha;
			this._contextGlobalAlpha = currentState.globalAlpha;
		}
		if (currentState.globalCompositeOperation !== this._contextGlobalCompositeOperation) {
			this._context.globalCompositeOperation = currentState.globalCompositeOperation as GlobalCompositeOperation;
			this._contextGlobalCompositeOperation = currentState.globalCompositeOperation;
		}
		if (this._modifiedTransform) {
			this._modifiedTransform = false;
			const transformer = currentState.transformer;

			if (transformer.matrix[0] === 0 || transformer.matrix[3] === 0) {
				// node-canvas 側の不具合? アフィン変換行列における拡大縮小の x, y の係数のいずれかが 0 の場合それ以降描画がされなくなる。
				// そのためこれらの要素が 0 の際は context に対して変換行列を適用せず、描画をスキップする。
				// @see https://github.com/Automattic/node-canvas/issues/702
				return false;
			}

			// FIXME: canvas@2.11.2 時点で setTransform() の TypeScript の型定義が不足しているため暫定でコンパイルできるように修正
			// @see https://github.com/Automattic/node-canvas/pull/2322
			(this._context.setTransform as unknown as (a: number, b: number, c: number, d: number, e: number, f: number) => void)(
				transformer.matrix[0],
				transformer.matrix[1],
				transformer.matrix[2],
				transformer.matrix[3],
				transformer.matrix[4],
				transformer.matrix[5]
			);
		}

		return true;
	}

	private pushState(state: RenderingState): void {
		this._stateStack.push(state);
	}

	private popState(): void {
		if (this._stateStack.length <= 1) {
			return;
		}
		this._stateStack.pop();
		this._modifiedTransform = true;
	}

	private currentState(): RenderingState {
		return this._stateStack[this._stateStack.length - 1];
	}
}
