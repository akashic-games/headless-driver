import { akashicEngine as g } from "@akashic/engine-files";
import { NullRenderer } from "./NullRenderer";

export class NullSurface implements g.Surface {
	width: number;
	height: number;
	isDynamic: boolean;
	_drawable: any;
	_renderer: NullRenderer;
	_destroyed: boolean = false;

	constructor(width: number, height: number, drawable?: any, isDynamic?: boolean) {
		this.width = width;
		this.height = height;
		this._drawable = drawable;
		this.isDynamic = !!isDynamic;
		this._renderer = new NullRenderer();
	}

	renderer(): g.Renderer {
		return this._renderer;
	}

	isPlaying(): boolean {
		return false;
	}

	destroy(): void {
		this._destroyed = true;
	}

	destroyed(): boolean {
		return !!this._destroyed;
	}
}
