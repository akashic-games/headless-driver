import { akashicEngine as g } from "../../../engineFiles";

export class NodeCanvasGlyph implements g.Glyph {
	code: number;
	x: number;
	y: number;
	width: number;
	height: number;
	surface: g.Surface;
	offsetX: number;
	offsetY: number;
	advanceWidth: number;
	isSurfaceValid: boolean;
	_atlas: g.SurfaceAtlas | null;

	constructor(
		code: number,
		x: number,
		y: number,
		width: number,
		height: number,
		offsetX: number = 0,
		offsetY: number = 0,
		advanceWidth: number = width,
		surface: g.Surface,
		isSurfaceValid: boolean
	) {
		this.code = code;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
		this.advanceWidth = advanceWidth;
		this.surface = surface;
		this.isSurfaceValid = isSurfaceValid;
		this._atlas = null;
	}

	renderingWidth(fontSize: number): number {
		if (!this.width || !this.height) {
			return 0;
		}
		return (fontSize / this.height) * this.width;
	}
}
