import { akashicEngine as g } from "@akashic/engine-files";

export class NullRenderer implements g.Renderer {
	begin(): void {
		// do nothing
	}

	end(): void {
		// do nothing
	}

	clear(): void {
		// do nothing
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
		// do nothing
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
		// do nothing
	}

	translate(_x: number, _y: number): void {
		// do nothing
	}

	transform(_matrix: number[]): void {
		// do nothing
	}

	opacity(_opacity: number): void {
		// do nothing
	}

	save(): void {
		// do nothing
	}

	restore(): void {
		// do nothing
	}

	fillRect(_x: number, _y: number, _width: number, _height: number, _cssColor: string): void {
		// do nothing
	}

	setCompositeOperation(_operation: g.CompositeOperationString): void {
		// do nothing
	}

	setTransform(_matrix: number[]): void {
		// do nothing
	}

	setOpacity(_opacity: number): void {
		// do nothing
	}

	isSupportedShaderProgram(): boolean {
		return false;
	}

	setShaderProgram(shaderProgram: g.ShaderProgram | null): void {
		// do nothing
	}

	_getImageData(sx: number, sy: number, sw: number, sh: number): g.ImageData {
		return null!;
	}

	_putImageData(
		imageData: g.ImageData,
		dx: number,
		dy: number,
		dirtyX?: number,
		dirtyY?: number,
		dirtyWidth?: number,
		dirtyHeight?: number
	): void {
		// do nothing
	}
}
