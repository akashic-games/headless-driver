import { GetStartPointOptions, GetTickListOptions, Permission, StartPoint } from "@akashic/amflow";
import { Event, EventFlagsMask, EventIndex, Tick, TickIndex, TickList, TickListIndex } from "@akashic/playlog";
import { Trigger } from "@akashic/trigger";
import { sha256 } from "js-sha256";
import cloneDeep = require("lodash.clonedeep");
import { createError } from "./ErrorFactory";

export interface DumpedPlaylog {
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

	private permissionMap: Map<string, Permission> | null = new Map();
	private startPoints: StartPoint[] | null = [];
	private unfilteredTickList: TickList | null = null;
	private filteredTickList: TickList | null = null;
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
		return permission!;
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
		this.sendEventTrigger.fire(this.cloneDeep<Event>(event));
	}

	getTickList(opts: GetTickListOptions): TickList | null {
		if (!(this.unfilteredTickList && this.filteredTickList)) {
			return null;
		}
		const tickList = opts.excludeEventFlags && opts.excludeEventFlags.ignorable ? this.filteredTickList : this.unfilteredTickList;
		const from = Math.max(opts.begin, tickList[TickListIndex.From]);
		const to = Math.min(opts.end - 1, tickList[TickListIndex.To]);
		const ticks = tickList[TickListIndex.Ticks]!.filter((tick) => {
			const frame = tick[TickIndex.Frame];
			return from <= frame && frame <= to;
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
		this.startPoints!.push(startPoint);
		// timestamp をもとに昇順で並び替え
		this.startPoints!.sort((a, b) => a.timestamp - b.timestamp);
	}

	getStartPoint(opts: GetStartPointOptions): StartPoint | null {
		if (opts.frame === 0) {
			return this.startPoints![0] || null;
		}
		if (!this.startPoints!.length) {
			return null;
		}
		if (opts.timestamp != null) {
			for (let i = 0; i < this.startPoints!.length; i++) {
				if (opts.timestamp < this.startPoints![i].timestamp) {
					return this.startPoints![i - 1] || null;
				}
			}
			return this.startPoints![this.startPoints!.length - 1];
		} else if (opts.frame != null) {
			for (let i = 0; i < this.startPoints!.length; i++) {
				if (opts.frame < this.startPoints![i].frame) {
					return this.startPoints![i - 1] || null;
				}
			}
			return this.startPoints![this.startPoints!.length - 1];
		}
		return this.startPoints![0] || null;
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

	setTickList(tickList: TickList): void {
		this.unfilteredTickList = this.cloneDeep(tickList);
		this.filteredTickList = this.cloneDeep(tickList);
	}

	destroy(): void {
		if (this.isDestroyed()) {
			return;
		}
		this.sendEventTrigger.destroy();
		this.sendTickTrigger.destroy();
		this.sendEventTrigger = null!;
		this.sendTickTrigger = null!;
		this.permissionMap = null;
		this.startPoints = null;
	}

	isDestroyed(): boolean {
		return this.permissionMap == null;
	}

	createPlayToken(permission: Permission): string {
		const str = this.createRandomString(10);
		const token = sha256(str);
		this.permissionMap!.set(token, permission);
		return token;
	}

	deletePlayToken(token: string): void {
		this.permissionMap!.delete(token);
	}

	deleteAllPlayTokens(): void {
		this.permissionMap!.clear();
	}

	dump(): DumpedPlaylog {
		return {
			tickList: this.unfilteredTickList!,
			startPoints: this.startPoints!
		};
	}

	private authenticatePlayToken(token: string, revoke?: boolean): Permission | null {
		const permission = this.permissionMap!.get(token);
		if (permission) {
			if (revoke) {
				this.permissionMap!.delete(token);
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

		if (tick[TickIndex.Events] || tick[TickIndex.StorageData]) {
			// store unfiltered tick
			const unfilteredTick = this.cloneDeep<Tick>(tick);
			unfilteredTick[TickIndex.Events] = tick[TickIndex.Events]!.filter(
				(event) => !(event[EventIndex.EventFlags] & EventFlagsMask.Transient)
			);
			this.unfilteredTickList[TickListIndex.Ticks]!.push(unfilteredTick);

			// store filtered tick
			const filteredTick = this.cloneDeep<Tick>(tick);
			filteredTick[TickIndex.Events] = tick[TickIndex.Events]!.filter(
				(event) =>
					!(event[EventIndex.EventFlags] & EventFlagsMask.Transient) && !(event[EventIndex.EventFlags] & EventFlagsMask.Ignorable)
			);
			this.filteredTickList[TickListIndex.Ticks]!.push(filteredTick);
		}
	}
}
