import type { akashicEngine as g, pdi } from "aev2";
import { Looper } from "../../../Looper";
import type { PlatformParameters } from "../../Platform";
import { Platform } from "../../Platform";
import { NullSurface } from "./NullSurface";
import { ResourceFactory } from "./ResourceFactory";

export class PlatformV2 extends Platform implements pdi.Platform {
	private resFac: g.ResourceFactory;
	private rendererReq: pdi.RendererRequirement | null = null;
	private primarySurface: g.Surface | null = null;
	private eventHandler: pdi.PlatformEventHandler | null = null;
	private loopers: Looper[] = [];
	private isLooperPaused: boolean = false;

	constructor(param: PlatformParameters) {
		super(param);
		this.resFac = new ResourceFactory({
			errorHandler: (e: Error) => this.errorHandler(e),
			loadFileHandler: param.loadFileHandler
		});
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
			throw new Error("PlatformV2#getPrimarySurface(): Primary surface has not been initialized yet");
		}
		return this.primarySurface;
	}

	createLooper(fun: (deltaTime: number) => number): Looper {
		const looper = new Looper(fun, (e: Error) => this.errorHandler(e));
		if (this.isLooperPaused) {
			looper.debugStop();
		}
		this.loopers.push(looper);
		return looper;
	}

	advanceLoopers(ms: number): void {
		for (let i = 0; i < this.loopers.length; i++) {
			this.loopers[i].debugStep(ms);
		}
	}

	pauseLoopers(): void {
		this.isLooperPaused = true;
		for (let i = 0; i < this.loopers.length; i++) {
			this.loopers[i].debugStop();
		}
	}

	resumeLoopers(): void {
		this.isLooperPaused = false;
		for (let i = 0; i < this.loopers.length; i++) {
			this.loopers[i].debugStart();
		}
	}

	firePointEvent(event: pdi.PointEvent): void {
		this.eventHandler?.onPointEvent(event);
	}
}
