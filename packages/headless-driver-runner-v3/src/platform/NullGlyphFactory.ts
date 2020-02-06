import { akashicEngine as g } from "@akashic/engine-files";
import { NullGlyph } from "./NullGlyph";
import { NullSurface } from "./NullSurface";

export class NullGlyphFactory implements g.GlyphFactoryLike {
	fontFamily: g.FontFamily | string | (g.FontFamily | string)[];
	fontSize: number;
	baselineHeight: number;
	fontColor: string;
	fontWeight: g.FontWeight;
	strokeWidth: number;
	strokeColor: string;
	strokeOnly: boolean;

	private dummySurface: g.SurfaceLike = new NullSurface(0, 0);

	constructor(
		fontFamily: g.FontFamily | string | (g.FontFamily | string)[],
		fontSize: number,
		baselineHeight: number = fontSize,
		fontColor: string = "black",
		strokeWidth: number = 0,
		strokeColor: string = "black",
		strokeOnly: boolean = false,
		fontWeight: g.FontWeight = g.FontWeight.Normal
	) {
		this.fontFamily = fontFamily;
		this.fontSize = fontSize;
		this.fontWeight = fontWeight;
		this.baselineHeight = baselineHeight;
		this.fontColor = fontColor;
		this.strokeWidth = strokeWidth;
		this.strokeColor = strokeColor;
		this.strokeOnly = strokeOnly;
	}

	create(code: number): g.GlyphLike {
		return new NullGlyph(code, 0, 0, 0, 0, 0, 0, this.fontSize, this.dummySurface, true);
	}
}
