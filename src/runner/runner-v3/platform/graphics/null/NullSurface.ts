import { akashicEngine as g } from "../../../engineFiles";
import { NullRenderer } from "./NullRenderer";

export class NullSurface implements g.Surface {
	width: number;
	height: number;
	_drawable: any;
	_renderer: NullRenderer;
	_destroyed: boolean = false;

	constructor(width: number, height: number, drawable?: any) {
		this.width = width;
		this.height = height;
		this._drawable = drawable;
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
