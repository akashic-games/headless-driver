import { akashicEngine as g, pdi } from "@akashic/engine-files";
import { Looper, Platform, PlatformParameters } from "@akashic/headless-driver-runner";

import { ResourceFactory } from "./ResourceFactory";
import { NullSurface } from "./NullSurface";

export class PlatformV2 extends Platform implements pdi.Platform {
	private resFac: g.ResourceFactory;
	private rendererReq: pdi.RendererRequirement;
	private primarySurface: g.Surface;

	constructor(param: PlatformParameters) {
		super(param);
		this.resFac = new ResourceFactory((e: Error) => this.errorHandler(e));
		this.rendererReq = null;
		this.primarySurface = null;
	}

	getResourceFactory(): g.ResourceFactory {
		return this.resFac;
	}

	setRendererRequirement(requirement: pdi.RendererRequirement): void {
		this.rendererReq = requirement;
		this.primarySurface = new NullSurface(this.rendererReq.primarySurfaceWidth, this.rendererReq.primarySurfaceHeight, null);
	}

	setPlatformEventHandler(handler: pdi.PlatformEventHandler): void {
		// do nothing
	}

	getPrimarySurface(): g.Surface {
		return this.primarySurface;
	}

	createLooper(fun: (deltaTime: number) => number): Looper {
		return new Looper(fun, (e: Error) => this.errorHandler(e));
	}
}
