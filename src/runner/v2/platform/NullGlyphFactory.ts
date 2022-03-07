import { akashicEngine as g } from "aev2";
import { NullSurface } from "./NullSurface";

export class NullGlyphFactory extends g.GlyphFactory {
	private dummySurface: g.Surface = new NullSurface(0, 0);

	create(code: number): g.Glyph {
		return new g.Glyph(code, 0, 0, 0, 0, 0, 0, this.fontSize, this.dummySurface, true);
	}
	measureMinimumFontSize(): number {
		return 1;
	}
}
