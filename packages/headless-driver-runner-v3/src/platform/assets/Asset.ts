import { akashicEngine as g } from "@akashic/engine-files";

export abstract class Asset implements g.Asset {
	type!: string;
	id: string;
	path: string;
	originalPath: string;
	onDestroyed: g.Trigger<g.Asset>;

	constructor(id: string, path: string) {
		this.id = id;
		this.originalPath = path;
		this.path = this._assetPathFilter(path);
		this.onDestroyed = new g.Trigger<g.Asset>();
	}

	destroy(): void {
		this.onDestroyed.fire(this);
		(this as any).id = undefined;
		(this as any).originalPath = undefined;
		(this as any).path = undefined;
		this.onDestroyed.destroy();
		(this as any).onDestroyed = undefined;
	}

	destroyed(): boolean {
		return this.id === undefined;
	}

	inUse(): boolean {
		return false;
	}

	abstract _load(loader: g.AssetLoadHandler): void;

	_assetPathFilter(path: string): string {
		return path;
	}
}
