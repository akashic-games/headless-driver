import { akashicEngine as g } from "@akashic/engine-files";
import { SurfaceAtlasSlot } from "@akashic/pdi-common-impl";

export class NullSurfaceAtlas implements g.SurfaceAtlas {
	_surface: g.Surface;
	_accessScore: number;
	_emptySurfaceAtlasSlotHead: g.SurfaceAtlasSlot;
	_usedRectangleAreaSize: g.CommonSize;

	constructor(surface: g.Surface) {
		this._surface = surface;
		this._accessScore = 0;
		this._emptySurfaceAtlasSlotHead = new SurfaceAtlasSlot(0, 0, this._surface.width, this._surface.height);
		this._usedRectangleAreaSize = { width: 0, height: 0 };
	}

	addSurface(_surface: g.Surface, _offsetX: number, _offsetY: number, _width: number, _height: number): g.SurfaceAtlasSlot {
		return this._emptySurfaceAtlasSlotHead;
	}

	getAtlasUsedSize(): g.CommonSize {
		return this._usedRectangleAreaSize;
	}

	destroy(): void {
		this._surface.destroy();
	}

	destroyed(): boolean {
		return this._surface.destroyed();
	}
}
