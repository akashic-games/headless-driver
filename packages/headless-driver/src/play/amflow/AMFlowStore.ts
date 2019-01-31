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

	private startPoints: StartPoint[] = [];
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
				throw new Error("illegal age tick");
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
		// TODO: イベントのスタック化
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
		this.startPoints.push(startPoint);
	}

	getStartPoint(opts?: GetStartPointOptions): StartPoint | null {
		if (!this.startPoints.length) {
			return null;
		}
		if (opts != null) {
			if (opts.frame != null) {
				return this.startPoints.filter(s => s.frame <= opts.frame).sort((a, b) => (a.frame < b.frame ? 1 : -1))[0] || null;
			} else if (opts.timestamp != null) {
				return (
					this.startPoints.filter(s => s.timestamp <= opts.timestamp).sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))[0] ||
					null
				);
			}
		}
		return this.startPoints.find(s => s.frame === 0) || null;
	}

	destroy(): void {
		this.sendEventTrigger.destroy();
		this.sendTickTrigger.destroy();
		this.sendEventTrigger = null;
		this.sendTickTrigger = null;
		this.amflowClientManager = null;
	}

	private cloneDeep<T>(target: T): T {
		return cloneDeep(target);
	}
}
