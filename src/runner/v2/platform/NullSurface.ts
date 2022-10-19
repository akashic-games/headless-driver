import { akashicEngine as g } from "engine-files-v2";
import { NullRenderer } from "./NullRenderer";

export class NullSurface extends g.Surface {
	private _renderer: g.Renderer;

	constructor(width: number, height: number, drawable?: any, isDynamic?: boolean) {
		super(width, height, drawable, isDynamic);
		this._renderer = new NullRenderer();
	}

	renderer(): g.Renderer {
		return this._renderer;
	}

	isPlaying(): boolean {
		return false;
	}
}
