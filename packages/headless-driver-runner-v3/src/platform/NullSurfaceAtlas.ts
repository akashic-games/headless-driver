import { akashicEngine as g } from "@akashic/engine-files";

export class NullSurfaceAtlas implements g.SurfaceAtlasLike {
	_surface: g.SurfaceLike;
	_accessScore: number;
	_emptySurfaceAtlasSlotHead: g.SurfaceAtlasSlotLike;
	_usedRectangleAreaSize: g.CommonSize;

	constructor(surface: g.SurfaceLike) {
		this._surface = surface;
		this._accessScore = 0;
		this._emptySurfaceAtlasSlotHead = new g.SurfaceAtlasSlot(0, 0, this._surface.width, this._surface.height);
		this._usedRectangleAreaSize = { width: 0, height: 0 };
	}

	addSurface(_surface: g.SurfaceLike, _offsetX: number, _offsetY: number, _width: number, _height: number): g.SurfaceAtlasSlotLike {
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
