import { akashicEngine as g } from "@akashic/engine-files";

export class NullSurfaceAtlas extends g.SurfaceAtlas {
	constructor(surface: g.Surface) {
		super(surface);
	}

	addSurface(_surface: g.Surface, _offsetX: number, _offsetY: number, _width: number, _height: number): g.SurfaceAtlasSlot {
		return this._emptySurfaceAtlasSlotHead;
	}
}
