import * as _ from "lodash";
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

	private startPoint: StartPoint = null;
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
			tick = this.deepCopy(tick);
			this.tickList[2].push(tick);
		}
		this.sendTickTrigger.fire(tick);
	}

	sendEvent(event: Event): void {
		// TODO: イベントのスタック化
		this.sendEventTrigger.fire(this.deepCopy(event));
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
		// TODO: frame:0 以外の保存
		if (startPoint.frame === 0) {
			this.startPoint = startPoint;
		}
	}

	getStartPoint(opts: GetStartPointOptions): StartPoint {
		// TODO: opts の指定
		return this.startPoint;
	}

	destroy(): void {
		this.sendEventTrigger.destroy();
		this.sendTickTrigger.destroy();
		this.sendEventTrigger = null;
		this.sendTickTrigger = null;
		this.amflowClientManager = null;
	}

	private deepCopy(target: any): any {
		return _.cloneDeep(target);
	}
}
