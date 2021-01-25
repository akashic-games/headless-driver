import { akashicEngine as g } from "@akashic/engine-files";

/* eslint  @typescript-eslint/no-unused-vars: 0 */
// NullRenderer class は定義のみあれば良いので、no-unused-vars を無効とする。
export class NullRenderer extends g.Renderer {
	clear(): void {
		//
	}

	drawImage(
		surface: g.Surface,
		offsetX: number,
		offsetY: number,
		width: number,
		height: number,
		destOffsetX: number,
		destOffsetY: number
	): void {
		//
	}

	drawSprites(
		surface: g.Surface,
		offsetX: number[],
		offsetY: number[],
		width: number[],
		height: number[],
		canvasOffsetX: number[],
		canvasOffsetY: number[],
		count: number
	): void {
		//
	}

	drawSystemText(
		text: string,
		x: number,
		y: number,
		maxWidth: number,
		fontSize: number,
		textAlign: g.TextAlign,
		textBaseline: g.TextBaseline,
		textColor: string,
		fontFamily: g.FontFamily,
		strokeWidth: number,
		strokeColor: string,
		strokeOnly: boolean
	): void {
		//
	}

	translate(x: number, y: number): void {
		//
	}

	transform(matrix: number[]): void {
		//
	}

	opacity(opacity: number): void {
		//
	}

	save(): void {
		//
	}

	restore(): void {
		//
	}

	fillRect(x: number, y: number, width: number, height: number, cssColor: string): void {
		//
	}

	setCompositeOperation(operation: g.CompositeOperation): void {
		//
	}

	setTransform(matrix: number[]): void {
		//
	}

	setOpacity(opacity: number): void {
		//
	}
}
