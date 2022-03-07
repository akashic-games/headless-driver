import { Looper } from "../../../Looper";
import type { PlatformParameters } from "../../Platform";
import { Platform } from "../../Platform";
import type { akashicEngine as g, pdi } from "../engineFiles";
import { NullSurface } from "./graphics/null/NullSurface";

export class PlatformV3 extends Platform implements pdi.Platform {
	private resFac: g.ResourceFactory;
	private rendererReq: pdi.RendererRequirement | null = null;
	private primarySurface: g.Surface | null = null;
	private eventHandler: pdi.PlatformEventHandler | null = null;
	private loopers: Looper[] = [];
	private isLooperPaused: boolean = false;

	constructor(param: PlatformParameters) {
		super(param);

		// NOTE: このファイルの require() 時点で ResourceFactory 側の依存モジュールを読み込ませないよう、動的に require() する。
		// (このモジュールの利用元である headless-driver が NodeVM 上で起動する仕様上の制限のための苦肉の策)
		/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-var-requires */
		const ResourceFactory =
			this.renderingMode === "canvas" && this.trusted
				? require("./NodeCanvasResourceFactory").NodeCanvasResourceFactory
				: require("./NullResourceFactory").NullResourceFactory;
		/* eslint-enable */

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

		if (this.renderingMode === "canvas") {
			if (this.trusted) {
				/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-var-requires */
				const Canvas = require("canvas").Canvas;
				const NodeCanvasSurface = require("./graphics/canvas/NodeCanvasSurface").NodeCanvasSurface;
				/* eslint-enable */

				const canvas = new Canvas(this.rendererReq.primarySurfaceWidth, this.rendererReq.primarySurfaceHeight);
				this.primarySurface = new NodeCanvasSurface(canvas);
			} else {
				throw Error("PlatformV3#setRendererRequirement(): Must given trusted === `true` if set renderingMode === 'canvas'");
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
