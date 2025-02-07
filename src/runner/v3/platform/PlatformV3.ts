import { Looper } from "../../../Looper";
import type { PlatformParameters } from "../../Platform";
import { Platform } from "../../Platform";
import type { akashicEngine as g, pdi } from "../engineFiles";
import { NullSurface } from "./graphics/null/NullSurface";
import { NodeCanvasFactory } from "./NodeCanvasFactory";
import { NodeCanvasResourceFactory } from "./NodeCanvasResourceFactory";
import { NullResourceFactory } from "./NullResourceFactory";

export class PlatformV3 extends Platform implements pdi.Platform {
	private resFac: g.ResourceFactory;
	private rendererReq: pdi.RendererRequirement | null = null;
	private primarySurface: g.Surface | null = null;
	private eventHandler: pdi.PlatformEventHandler | null = null;
	private loopers: Looper[] = [];
	private isLooperPaused: boolean = false;

	constructor(param: PlatformParameters) {
		super(param);

		let resourceFactory: g.ResourceFactory;

		if ((this.renderingMode === "canvas" || this.renderingMode === "canvas_napi") && this.trusted) {
			const canvasFactory = new NodeCanvasFactory(this.renderingMode);
			resourceFactory = new NodeCanvasResourceFactory({
				canvasFactory,
				errorHandler: (e: Error) => this.errorHandler(e),
				loadFileHandler: param.loadFileHandler
			});
		} else {
			resourceFactory = new NullResourceFactory({
				errorHandler: (e: Error) => this.errorHandler(e),
				loadFileHandler: param.loadFileHandler
			});
		}

		this.resFac = resourceFactory;
	}

	getResourceFactory(): g.ResourceFactory {
		return this.resFac;
	}

	setRendererRequirement(requirement: pdi.RendererRequirement): void {
		this.rendererReq = requirement;

		if (this.renderingMode === "canvas" || this.renderingMode === "canvas_napi") {
			if (this.trusted) {
				this.primarySurface = this.resFac.createSurface(
					this.rendererReq.primarySurfaceWidth,
					this.rendererReq.primarySurfaceHeight
				);
			} else {
				throw Error(
					"PlatformV3#setRendererRequirement(): 'trusted' must be true when 'renderingMode' is set to 'canvas' or 'canvas_napi'."
				);
			}
		} else {
			this.primarySurface = new NullSurface(this.rendererReq.primarySurfaceWidth, this.rendererReq.primarySurfaceHeight);
		}
	}

	setPlatformEventHandler(handler: pdi.PlatformEventHandler): void {
		this.eventHandler = handler;
	}

	getPrimarySurface(): g.Surface {
		if (this.primarySurface == null) {
			throw new Error("PlatformV3#getPrimarySurface(): Primary surface has not been initialized yet");
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
	stepLoopers(): void {
		for (let i = 0; i < this.loopers.length; i++) {
			// v3 のみ対応。game-driver 側の実装により NaN を渡すと次のフレームまで進む。
			this.loopers[i].debugStep(NaN);
		}
	}
	firePointEvent(event: pdi.PlatformPointEvent): void {
		this.eventHandler?.onPointEvent(event);
	}
}
