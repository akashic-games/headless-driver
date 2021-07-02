import { akashicEngine as g } from "../engineFiles";

export class NullRenderer extends g.Renderer {
	clear(): void {
		//
	}

	drawImage(
		_surface: g.Surface,
		_offsetX: number,
		_offsetY: number,
		_width: number,
		_height: number,
		_destOffsetX: number,
		_destOffsetY: number
	): void {
		//
	}

	drawSprites(
		_surface: g.Surface,
		_offsetX: number[],
		_offsetY: number[],
		_width: number[],
		_height: number[],
		_canvasOffsetX: number[],
		_canvasOffsetY: number[],
		_count: number
	): void {
		//
	}

	drawSystemText(
		_text: string,
		_x: number,
		_y: number,
		_maxWidth: number,
		_fontSize: number,
		_textAlign: g.TextAlign,
		_textBaseline: g.TextBaseline,
		_textColor: string,
		_fontFamily: g.FontFamily,
		_strokeWidth: number,
		_strokeColor: string,
		_strokeOnly: boolean
	): void {
		//
	}

	translate(_x: number, _y: number): void {
		//
	}

	transform(_matrix: number[]): void {
		//
	}

	opacity(_opacity: number): void {
		//
	}

	save(): void {
		//
	}

	restore(): void {
		//
	}

	fillRect(_x: number, _y: number, _width: number, _height: number, _cssColor: string): void {
		//
	}

	setCompositeOperation(_operation: g.CompositeOperation): void {
		//
	}

	setTransform(_matrix: number[]): void {
		//
	}

	setOpacity(_opacity: number): void {
		//
	}
}
