import type { GetStartPointOptions, GetTickListOptions, Permission, StartPoint } from "@akashic/amflow";
import type { Event, Tick, TickList } from "@akashic/playlog";
import { EventFlagsMask, EventIndex, TickIndex, TickListIndex } from "@akashic/playlog";
import { Trigger } from "@akashic/trigger";
import { sha256 } from "js-sha256";
import cloneDeep = require("lodash.clonedeep");
import { createError } from "./ErrorFactory";
import type { DumpedPlaylog } from "./types";

export interface AMFlowStoreOptions {
	/**
	 * 受信されないイベントをバッファリングするか。
	 *
	 * 真の場合、受信者が一つもない状態で送信されたイベントをバッファに保持する。
	 * 保持されたイベントは、最初のイベントハンドラが (AMFlow#onEvent() で) 登録された時、そのハンドラにすべて引き渡される。
	 * (二つ目以降のハンドラは受け取れないことに注意)
	 */
	preservesUnhandledEvents?: boolean;
}

/**
 * AMFlow のストア。
 * 一つのプレーに対して一つ存在する。
 */
export class AMFlowStore {
	playId: string;
	putStartPointTrigger: Trigger<StartPoint> = new Trigger();

	private sendEventTrigger: Trigger<Event> = new Trigger();
	private sendTickTrigger: Trigger<Tick> = new Trigger();
	private permissionMap: Map<string, Permission> = new Map();
	private startPoints: StartPoint[] = [];
	private unfilteredTickList: TickList | null = null;
	private filteredTickList: TickList | null = null;
	private suspended: boolean;

	private options: AMFlowStoreOptions | null = null;
	private unhandledEvents: Event[] = [];

	constructor(playId: string) {
		this.playId = playId;
		this.suspended = false;
	}

	authenticate(token: string, revoke?: boolean): Permission {
		const permission = this.authenticatePlayToken(token, revoke);
		if (!permission) {
			throw createError("invalid_status", "Cannot call AMFlowStore#authenticate without authenticated token");
		}
		if (this.isSuspended() && (permission.sendEvent || permission.writeTick)) {
			throw createError("permission_error", "Play may be suspended");
		}

		return permission;
	}

	sendTick(tick: Tick): void {
		if (this.isSuspended()) {
			throw createError("bad_request", "Play may be suspended");
		}
		this.pushTick(tick);
		this.sendTickTrigger.fire(tick);
	}

	sendEvent(event: Event): void {
		if (this.isSuspended()) {
			throw createError("bad_request", "Play may be suspended");
		}

		const ev = this.cloneDeep<Event>(event);
		if (this.options?.preservesUnhandledEvents && this.sendEventTrigger.length === 0) {
			this.unhandledEvents.push(ev);
			return;
		}

		this.sendEventTrigger.fire(ev);
	}

	onTick(handler: (tick: Tick) => void): void {
		this.sendTickTrigger.add(handler);
	}

	offTick(handler: (tick: Tick) => void): void {
		this.sendTickTrigger.remove(handler);
	}

	onEvent(handler: (event: Event) => void): void {
		this.sendEventTrigger.add(handler);
		if (0 < this.unhandledEvents.length) {
			this.unhandledEvents.forEach((ev) => this.sendEventTrigger.fire(ev));
			this.unhandledEvents = [];
		}
	}

	offEvent(handler: (event: Event) => void): void {
		this.sendEventTrigger.remove(handler);
	}

	getTickList(opts: GetTickListOptions): TickList | null {
		if (!(this.unfilteredTickList && this.filteredTickList)) {
			return null;
		}
		const tickList = opts.excludeEventFlags && opts.excludeEventFlags.ignorable ? this.filteredTickList : this.unfilteredTickList;
		const from = Math.max(opts.begin, tickList[TickListIndex.From]);
		const to = Math.min(opts.end - 1, tickList[TickListIndex.To]);
		if (to < from) {
			return null;
		}

		const tickListTicks = tickList[TickListIndex.Ticks];
		if (tickListTicks == null) {
			return [from, to];
		}
		const ticks = tickListTicks.filter((tick) => {
			const frame = tick[TickIndex.Frame];
			return from <= frame && frame <= to;
		});

		return [from, to, ticks];
	}

	putStartPoint(startPoint: StartPoint): void {
		if (this.isSuspended()) {
			throw createError("bad_request", "Play may be suspended");
		}
		this.putStartPointTrigger.fire(startPoint);

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

	setTickList(tickList: TickList | null): void {
		this.unfilteredTickList = tickList ? this.cloneDeep(tickList) : null;
		this.filteredTickList = tickList ? this.cloneDeep(tickList) : null;
	}

	setDumpedPlaylog(dumped: DumpedPlaylog): void {
		this.setTickList(dumped.tickList);
		dumped.startPoints.forEach((sp) => this.putStartPoint(sp));
	}

	setOptions(options: AMFlowStoreOptions | null): void {
		this.options = options;
	}

	destroy(): void {
		if (this.isDestroyed()) {
			return;
		}
		this.sendEventTrigger.destroy();
		this.sendTickTrigger.destroy();
		this.sendEventTrigger = null!;
		this.sendTickTrigger = null!;
		this.permissionMap = null!;
		this.startPoints = null!;
		this.unhandledEvents = null!;
		this.putStartPointTrigger = null!;
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

	dump(): DumpedPlaylog {
		return {
			tickList: this.unfilteredTickList,
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

	private pushTick(tick: Tick): void {
		if (this.unfilteredTickList) {
			if (
				this.unfilteredTickList[TickListIndex.From] <= tick[TickIndex.Frame] &&
				tick[TickIndex.Frame] <= this.unfilteredTickList[TickListIndex.To]
			) {
				// illegal age tick
				return;
			}
			this.unfilteredTickList[TickListIndex.To] = tick[TickIndex.Frame];
		} else {
			this.unfilteredTickList = [tick[TickIndex.Frame], tick[TickIndex.Frame], []];
		}

		if (this.filteredTickList) {
			this.filteredTickList[TickListIndex.To] = tick[TickIndex.Frame];
		} else {
			this.filteredTickList = [tick[TickIndex.Frame], tick[TickIndex.Frame], []];
		}

		const tickEvents = tick[TickIndex.Events];
		if (tickEvents) {
			// store unfiltered tick
			const unfilteredTick = this.cloneDeep<Tick>(tick);
			unfilteredTick[TickIndex.Events] = tickEvents.filter((event) => !(event[EventIndex.EventFlags] & EventFlagsMask.Transient));
			this.unfilteredTickList[TickListIndex.Ticks]!.push(unfilteredTick);

			// store filtered tick
			const filteredTick = this.cloneDeep<Tick>(tick);
			filteredTick[TickIndex.Events] = tickEvents.filter(
				(event) =>
					!(event[EventIndex.EventFlags] & EventFlagsMask.Transient) && !(event[EventIndex.EventFlags] & EventFlagsMask.Ignorable)
			);
			this.filteredTickList[TickListIndex.Ticks]!.push(filteredTick);
		}
	}
}
