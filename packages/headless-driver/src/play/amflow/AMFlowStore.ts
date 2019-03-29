import cloneDeep = require("lodash.clonedeep");
import { Permission, StartPoint, GetStartPointOptions } from "@akashic/amflow";
import { Tick, TickList, Event } from "@akashic/playlog";
import { Trigger } from "@akashic/trigger";
import { AMFlowClientManager } from "../AMFlowClientManager";

/**
 * AMFlow のストア。
 * 一つのプレーに対して一つ存在する。
 */
export class AMFlowStore {
	sendEventTrigger: Trigger<Event> = new Trigger();
	sendTickTrigger: Trigger<Tick> = new Trigger();

	private playId: string;
	private amflowClientManager: AMFlowClientManager;

	private startPoints: StartPoint[] | null = [];
	private tickList: TickList = null;

	constructor(playId: string, amflowClientManager: AMFlowClientManager) {
		this.playId = playId;
		this.amflowClientManager = amflowClientManager;
	}

	authenticate(token: string, revoke?: boolean): Permission {
		return this.amflowClientManager.authenticatePlayToken(this.playId, token, revoke);
	}

	sendTick(tick: Tick): void {
		if (this.tickList) {
			if (this.tickList[0] <= tick[0] && tick[0] <= this.tickList[1]) {
				// illegal age tick
				return;
			}
			this.tickList[1] = tick[0];
		} else {
			this.tickList = [tick[0], tick[0], []];
		}
		if (tick[1] || tick[2]) {
			tick = this.cloneDeep<Tick>(tick);
			this.tickList[2].push(tick);
		}
		this.sendTickTrigger.fire(tick);
	}

	sendEvent(event: Event): void {
		this.sendEventTrigger.fire(this.cloneDeep<Event>(event));
	}

	getTickList(from: number, to: number): TickList | null {
		if (!this.tickList) {
			return null;
		}
		from = Math.max(from, this.tickList[0]);
		to = Math.min(to, this.tickList[1]);
		const ticks = this.tickList[2].filter(tick => {
			const age = tick[0];
			return from <= age && age <= to;
		});

		return [from, to, ticks];
	}

	putStartPoint(startPoint: StartPoint): void {
		// NOTE: frame: 0 のみ第0要素に保持する
		if (startPoint.frame === 0) {
			this.startPoints = [startPoint];
			return;
		}
		this.startPoints.push(startPoint);
		// timestamp をもとに昇順で並び替え
		this.startPoints.sort((a, b) => a.timestamp - b.timestamp);
	}

	getStartPoint(opts: GetStartPointOptions): StartPoint | null {
		if (opts.frame === 0) {
			return this.startPoints[0] || null;
		}
		if (!this.startPoints.length) {
			return null;
		}
		if (opts.timestamp != null) {
			for (let i = 0; i < this.startPoints.length; i++) {
				if (opts.timestamp < this.startPoints[i].timestamp) {
					return this.startPoints[i - 1] || null;
				}
			}
			return this.startPoints[this.startPoints.length - 1];
		} else if (opts.frame != null) {
			for (let i = 0; i < this.startPoints.length; i++) {
				if (opts.frame < this.startPoints[i].frame) {
					return this.startPoints[i - 1] || null;
				}
			}
			return this.startPoints[this.startPoints.length - 1];
		}
		return this.startPoints[0] || null;
	}

	destroy(): void {
		if (this.isDestroyed()) {
			return;
		}
		this.sendEventTrigger.destroy();
		this.sendTickTrigger.destroy();
		this.sendEventTrigger = null;
		this.sendTickTrigger = null;
		this.amflowClientManager = null;
		this.startPoints = null;
	}

	isDestroyed(): boolean {
		return this.amflowClientManager == null;
	}

	private cloneDeep<T>(target: T): T {
		return cloneDeep(target);
	}
}
