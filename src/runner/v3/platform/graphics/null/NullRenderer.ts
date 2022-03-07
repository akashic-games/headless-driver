import type { akashicEngine as g } from "../../../engineFiles";

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

	setShaderProgram(_shaderProgram: g.ShaderProgram | null): void {
		// do nothing
	}

	_getImageData(_sx: number, _sy: number, _sw: number, _sh: number): g.ImageData | null {
		return null;
	}

	_putImageData(
		_imageData: g.ImageData,
		_dx: number,
		_dy: number,
		_dirtyX?: number,
		_dirtyY?: number,
		_dirtyWidth?: number,
		_dirtyHeight?: number
	): void {
		// do nothing
	}
}
