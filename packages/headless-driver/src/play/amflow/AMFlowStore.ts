import { GetStartPointOptions, Permission, StartPoint } from "@akashic/amflow";
import { Event, Tick, TickList } from "@akashic/playlog";
import { Trigger } from "@akashic/trigger";
import cloneDeep = require("lodash.clonedeep");
import { AMFlowClientManager } from "../AMFlowClientManager";
import { createError } from "./ErrorFactory";

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
	private freezed: boolean;

	constructor(playId: string, amflowClientManager: AMFlowClientManager) {
		this.playId = playId;
		this.freezed = false;
		this.amflowClientManager = amflowClientManager;
	}

	authenticate(token: string, revoke?: boolean): Permission {
		const permission = this.amflowClientManager.authenticatePlayToken(this.playId, token, revoke);
		if (this.isFreezed() && permission && (permission.sendEvent || permission.writeTick)) {
			throw createError("permission_error", "Play may be suspended");
		}
		return permission;
	}

	sendTick(tick: Tick): void {
		if (this.isFreezed()) {
			throw createError("bad_request", "Play may be suspended");
		}
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
		if (this.isFreezed()) {
			throw createError("bad_request", "Play may be suspended");
		}
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
		if (this.isFreezed()) {
			throw createError("bad_request", "Play may be suspended");
		}
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

	/**
	 * この AMFlowStore がフリーズ状態かどうか。
	 */
	isFreezed(): boolean {
		return this.freezed;
	}

	/**
	 * この AMFlowStore をフリーズ状態にする。
	 * フリーズ状態の場合、次の機能の呼び出し時に例外が発される。
	 * * `this.putStartPoint()` による start point の書き込み
	 * * `this.sendTick()` による tick の書き込み
	 * * `this.sendEvent()` による event の送信
	 */
	freeze(): void {
		this.freezed = true;
	}

	/**
	 * この AMFlowStore のフリーズ状態を解除する。
	 */
	unfreeze(): void {
		this.freezed = false;
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
