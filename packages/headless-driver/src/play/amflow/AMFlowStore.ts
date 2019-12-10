import { GetStartPointOptions, Permission, StartPoint } from "@akashic/amflow";
import { Event, Tick, TickList } from "@akashic/playlog";
import { Trigger } from "@akashic/trigger";
import { sha256 } from "js-sha256";
import cloneDeep = require("lodash.clonedeep");
import { createError } from "./ErrorFactory";

export interface AmflowDump {
	tickList: TickList;
	startPoints: StartPoint[];
}

/**
 * AMFlow のストア。
 * 一つのプレーに対して一つ存在する。
 */
export class AMFlowStore {
	playId: string;
	sendEventTrigger: Trigger<Event> = new Trigger();
	sendTickTrigger: Trigger<Tick> = new Trigger();

	private permissionMap: Map<string, Permission> = new Map();
	private startPoints: StartPoint[] | null = [];
	private tickList: TickList = null;
	private suspended: boolean;

	constructor(playId: string) {
		this.playId = playId;
		this.suspended = false;
	}

	authenticate(token: string, revoke?: boolean): Permission {
		const permission = this.authenticatePlayToken(token, revoke);
		if (this.isSuspended() && permission && (permission.sendEvent || permission.writeTick)) {
			throw createError("permission_error", "Play may be suspended");
		}
		return permission;
	}

	sendTick(tick: Tick): void {
		if (this.isSuspended()) {
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
		if (this.isSuspended()) {
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
		if (this.isSuspended()) {
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
	 * この AMFlowStore が停止しているかどうか。
	 */
	isSuspended(): boolean {
		return this.suspended;
	}

	/**
	 * この AMFlowStore を停止する。
	 * 停止状態の場合、次の機能の呼び出し時に例外が発される。
	 * * `this.putStartPoint()` による start point の書き込み
	 * * `this.sendTick()` による tick の書き込み
	 * * `this.sendEvent()` による event の送信
	 */
	suspend(): void {
		this.suspended = true;
	}

	/**
	 * この AMFlowStore を再開する。
	 */
	resume(): void {
		this.suspended = false;
	}

	destroy(): void {
		if (this.isDestroyed()) {
			return;
		}
		this.sendEventTrigger.destroy();
		this.sendTickTrigger.destroy();
		this.sendEventTrigger = null;
		this.sendTickTrigger = null;
		this.permissionMap = null;
		this.startPoints = null;
	}

	isDestroyed(): boolean {
		return this.permissionMap == null;
	}

	createPlayToken(permission: Permission): string {
		const str = this.createRandomString(10);
		const token = sha256(str);
		this.permissionMap.set(token, permission);
		return token;
	}

	deletePlayToken(token: string): void {
		this.permissionMap.delete(token);
	}

	deleteAllPlayTokens(): void {
		this.permissionMap.clear();
	}

	dump(): AmflowDump {
		return {
			tickList: this.tickList,
			startPoints: this.startPoints
		};
	}

	private authenticatePlayToken(token: string, revoke?: boolean): Permission | null {
		const permission = this.permissionMap.get(token);
		if (permission) {
			if (revoke) {
				this.permissionMap.delete(token);
			}
			return permission;
		}
		return null;
	}

	private cloneDeep<T>(target: T): T {
		return cloneDeep(target);
	}

	private createRandomString(length: number): string {
		const str = "abcdefghijklmnopqrstuvwxyz0123456789";
		const cl = str.length;
		let r = "";
		for (let i = 0; i < length; i++) {
			r += str[Math.floor(Math.random() * cl)];
		}
		return r;
	}
}
