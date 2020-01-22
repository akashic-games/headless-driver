import { akashicEngine as g } from "@akashic/engine-files";

export class NullRenderer implements g.RendererLike {
	begin(): void {
		//
	}

	end(): void {
		//
	}

	clear(): void {
		//
	}

	drawImage(
		_surface: g.SurfaceLike,
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

	isSupportedShaderProgram(): boolean {
		return false;
	}

	setShaderProgram(shaderProgram: g.ShaderProgram | null): void {
		//
	}

	_getImageData(sx: number, sy: number, sw: number, sh: number): g.ImageData {
		return null;
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
		//
	}
}
