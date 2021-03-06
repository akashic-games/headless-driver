import { akashicEngine as g, pdi } from "@akashic/engine-files";
import { Looper, Platform, PlatformParameters } from "@akashic/headless-driver-runner";
import { NullSurface } from "./NullSurface";
import { ResourceFactory } from "./ResourceFactory";

export class PlatformV2 extends Platform implements pdi.Platform {
	private resFac: g.ResourceFactory;
	private rendererReq: pdi.RendererRequirement | null = null;
	private primarySurface: g.Surface | null = null;
	private eventHandler: pdi.PlatformEventHandler | null = null;
	private loopers: Looper[] = [];

	constructor(param: PlatformParameters) {
		super(param);
		this.resFac = new ResourceFactory((e: Error) => this.errorHandler(e));
	}

	getResourceFactory(): g.ResourceFactory {
		return this.resFac;
	}

	setRendererRequirement(requirement: pdi.RendererRequirement): void {
		this.rendererReq = requirement;
		this.primarySurface = new NullSurface(this.rendererReq.primarySurfaceWidth, this.rendererReq.primarySurfaceHeight, null);
	}

	setPlatformEventHandler(handler: pdi.PlatformEventHandler): void {
		this.eventHandler = handler;
	}

	getPlatformHandler(): pdi.PlatformEventHandler | null {
		return this.eventHandler;
	}

	getPrimarySurface(): g.Surface {
		if (this.primarySurface == null) {
			throw new Error("Cannot call Platform#getPrimarySurface() before setRenderer");
		}
		return this.primarySurface;
	}

	createLooper(fun: (deltaTime: number) => number): Looper {
		const looper = new Looper(fun, (e: Error) => this.errorHandler(e));
		this.loopers.push(looper);
		return looper;
	}

	advanceLoopers(ms: number): void {
		for (let i = 0; i < this.loopers.length; i++) {
			this.loopers[i].debugStep(ms);
		}
	}

	pauseLoopers(): void {
		for (let i = 0; i < this.loopers.length; i++) {
			this.loopers[i].debugStop();
		}
	}

	resumeLoopers(): void {
		for (let i = 0; i < this.loopers.length; i++) {
			this.loopers[i].debugStart();
		}
	}

	firePointEvent(event: pdi.PointEvent): void {
		this.eventHandler?.onPointEvent(event);
	}
}
