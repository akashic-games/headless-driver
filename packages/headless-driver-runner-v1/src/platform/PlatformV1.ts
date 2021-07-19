import { akashicEngine as g, pdi } from "@akashic/engine-files";
import { Looper, Platform, PlatformParameters } from "@akashic/headless-driver-runner";
import { NullSurface } from "./NullSurface";
import { ResourceFactory } from "./ResourceFactory";

export class PlatformV1 extends Platform implements pdi.Platform {
	private resFac: g.ResourceFactory;
	private rendererReq: pdi.RendererRequirement | null = null;
	private primarySurface: g.Surface | null = null;
	private eventHandler: pdi.PlatformEventHandler | null = null;
	private loopers: Looper[] = [];
	private _isLooperPaused: boolean = false;

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

	getPrimarySurface(): g.Surface {
		if (this.primarySurface == null) {
			throw new Error("PlatformV1#getPrimarySurface(): Primary surface has not been initialized yet");
		}
		return this.primarySurface;
	}

	createLooper(fun: (deltaTime: number) => number): Looper {
		const looper = new Looper(fun, (e: Error) => this.errorHandler(e));
		if (this._isLooperPaused) {
			looper.debugStop();
		}
		this.loopers.push(looper);
		return looper;
	}

	advanceLoopers(ms: number): void {
		this._isLooperPaused = true;
		for (let i = 0; i < this.loopers.length; i++) {
			this.loopers[i].debugStep(ms);
		}
	}

	pauseLoopers(): void {
		this._isLooperPaused = true;
		for (let i = 0; i < this.loopers.length; i++) {
			this.loopers[i].debugStop();
		}
	}

	resumeLoopers(): void {
		this._isLooperPaused = false;
		for (let i = 0; i < this.loopers.length; i++) {
			this.loopers[i].debugStart();
		}
	}

	firePointEvent(event: pdi.PointEvent): void {
		this.eventHandler?.onPointEvent(event);
	}
}
