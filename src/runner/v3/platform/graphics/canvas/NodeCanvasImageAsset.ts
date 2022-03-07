import { Canvas, Image } from "canvas";
import type { akashicEngine as g } from "../../../engineFiles";
import { Asset } from "../../assets/Asset";
import { NodeCanvasSurface } from "./NodeCanvasSurface";

interface ImageAssetDataCache {
	data: Image;
	id: string;
	onDestroyed: g.Trigger<g.Asset>;
	originalPath: string;
	path: string;
	width: number;
	height: number;
}

export class NodeCanvasImageAsset extends Asset implements g.ImageAsset {
	type: "image" = "image";
	width: number;
	height: number;
	hint: g.ImageAssetHint | undefined;

	_surface: g.Surface | null = null;
	private data: Image | null = null;
	private dataCache: ImageAssetDataCache | null = null;

	constructor(id: string, path: string, width: number, height: number) {
		super(id, path);
		this.width = width;
		this.height = height;
	}

	destroy(): void {
		if (this._surface && !this._surface.destroyed()) {
			this._surface.destroy();
		}
		this.data = null;
		this._surface = null;
		super.destroy();
	}

	_load(loader: g.AssetLoadHandler): void {
		if (this.dataCache != null) {
			// restore image asset data and metadata destroyed in this.destroy()
			this.data = this.dataCache.data;
			this.id = this.dataCache.id;
			this.onDestroyed = this.dataCache.onDestroyed;
			this.originalPath = this.dataCache.originalPath;
			this.path = this.dataCache.path;
			this.width = this.dataCache.width;
			this.height = this.dataCache.height;
			loader._onAssetLoad(this);
		} else {
			const image = new Image();
			image.onerror = () => {
				loader._onAssetError(this, {
					name: "AssetLoadError",
					message: "HTMLImageAsset unknown loading error",
					retriable: false
				});
			};
			image.onload = () => {
				this.data = image;
				this.dataCache = {
					data: image,
					id: this.id,
					onDestroyed: this.onDestroyed,
					originalPath: this.originalPath,
					path: this.path,
					width: this.width,
					height: this.height
				};
				loader._onAssetLoad(this);
			};
			image.src = this.path;
		}
	}

	asSurface(): g.Surface {
		if (this.data == null) {
			throw new Error("NodeCanvasImageAsset#asSurface(): not yet loaded.");
		}
		if (this._surface == null) {
			const canvas = new Canvas(this.width, this.height);
			const context = canvas.getContext("2d");
			context.drawImage(this.data, 0, 0, this.width, this.height);
			this._surface = new NodeCanvasSurface(canvas);
		}
		return this._surface;
	}

	initialize(hint: g.ImageAssetHint): void {
		this.hint = hint;
	}
}
