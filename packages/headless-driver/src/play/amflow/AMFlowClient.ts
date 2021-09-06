import { AMFlow, GetStartPointOptions, GetTickListOptions, Permission, StartPoint } from "@akashic/amflow";
import { Event, EventFlagsMask, EventIndex, StorageData, StorageKey, StorageReadKey, StorageValue, Tick, TickList } from "@akashic/playlog";
import { Trigger } from "@akashic/trigger";
import { getSystemLogger } from "../../Logger";
import { AMFlowStore } from "./AMFlowStore";
import { createError } from "./ErrorFactory";
import { DumpedPlaylog } from "./types";

export type AMFlowState = "connecting" | "open" | "closing" | "closed";

/**
 * Runnerと1対1で対応するAMFlow実装。
 */
export class AMFlowClient implements AMFlow {
	playId: string;

	onPutStartPoint: Trigger<StartPoint> = new Trigger();

	protected state: AMFlowState = "connecting";
	private store: AMFlowStore;

	private permission: Permission | null = null;
	private tickHandlers: ((tick: Tick) => void)[] = [];
	private eventHandlers: ((event: Event) => void)[] = [];
	private unconsumedEvents: Event[] = [];

	constructor(playId: string, store: AMFlowStore) {
		this.playId = playId;
		this.store = store;
	}

	open(playId: string, callback?: (error: Error | null) => void): void {
		getSystemLogger().info("AMFlowClient#open()", playId);

		this.store.sendEventTrigger.add(this.handleSendEvent, this);
		this.store.sendTickTrigger.add(this.handleSendTick, this);
		this.store.putStartPointTrigger.add(this.handlePutStartPoint, this);
		this.state = "open";

		if (callback) {
			setImmediate(() => {
				if (this.playId !== playId) {
					callback(createError("runtime_error", "Invalid PlayID"));
				} else {
					callback(null);
				}
			});
		}
	}

	close(callback?: (error: Error | null) => void): void {
		getSystemLogger().info("AMFlowClient#close()");
		if (this.state !== "open") {
			if (callback) callback(createError("invalid_status", "Client is not open"));
			return;
		}

		this.destroy();
		this.state = "closed";

		if (callback) {
			setImmediate(() => callback(null));
		}
	}

	authenticate(token: string, callback: (error: Error | null, permission?: Permission) => void): void {
		setImmediate(() => {
			if (this.state !== "open") {
				callback(createError("invalid_status", "Client is not open"), undefined);
				return;
			}
			let permission: Permission;
			try {
				permission = this.store.authenticate(token);
			} catch (e) {
				callback(e, undefined);
				return;
			}
			this.permission = permission;
			getSystemLogger().info("AMFlowClient#authenticate()", this.playId, token, permission);
			if (permission) {
				callback(null, permission);
			} else {
				callback(createError("invalid_status", "Invalid playToken"), undefined);
			}
		});
	}

	setTickList(tickList: TickList | null): void {
		this.store.setTickList(tickList);
	}

	setDumpedPlaylog(dumped: DumpedPlaylog): void {
		this.store.setDumpedPlaylog(dumped);
	}

	sendTick(tick: Tick): void {
		if (this.state !== "open") {
			throw createError("invalid_status", "Client is not open");
		}
		if (this.permission == null) {
			throw createError("invalid_status", "Not authenticated");
		}
		if (!this.permission.writeTick) {
			throw createError("permission_error", "Permission denied");
		}
		this.store.sendTick(tick);
	}

	onTick(handler: (tick: Tick) => void): void {
		if (this.state !== "open") {
			throw createError("invalid_status", "Client is not open");
		}
		if (this.permission == null) {
			throw createError("invalid_status", "Not authenticated");
		}
		if (!this.permission.subscribeTick) {
			throw createError("permission_error", "Permission denied");
		}
		this.tickHandlers.push(handler);
	}

	offTick(handler: (tick: Tick) => void): void {
		if (this.state !== "open") {
			throw createError("invalid_status", "Client is not open");
		}
		if (this.permission == null) {
			throw createError("invalid_status", "Not authenticated");
		}
		this.tickHandlers = this.tickHandlers.filter((h) => h !== handler);
	}

	sendEvent(event: Event): void {
		if (this.state !== "open") {
			throw createError("invalid_status", "Client is not open");
		}
		if (this.permission == null) {
			throw createError("invalid_status", "Not authenticated");
		}
		if (!this.permission.sendEvent) {
			throw createError("permission_error", "Permission denied");
		}
		// Max Priority
		const prio = event[EventIndex.EventFlags] & EventFlagsMask.Priority;
		const tran = event[EventIndex.EventFlags] & EventFlagsMask.Transient;
		event[EventIndex.EventFlags] = tran | Math.min(prio, this.permission.maxEventPriority);
		this.store.sendEvent(event);
	}

	onEvent(handler: (event: Event) => void): void {
		if (this.state !== "open") {
			throw createError("invalid_status", "Client is not open");
		}
		if (this.permission == null) {
			throw createError("invalid_status", "Not authenticated");
		}
		if (!this.permission.subscribeEvent) {
			throw createError("permission_error", "Permission denied");
		}

		this.eventHandlers.push(handler);

		if (0 < this.unconsumedEvents.length) {
			this.eventHandlers.forEach((h) => {
				this.unconsumedEvents.forEach((ev) => h(ev));
			});
			this.unconsumedEvents = [];
		}
	}

	offEvent(handler: (event: Event) => void): void {
		if (this.state !== "open") {
			throw createError("invalid_status", "Client is not open");
		}
		if (this.permission == null) {
			throw createError("invalid_status", "Not authenticated");
		}
		this.eventHandlers = this.eventHandlers.filter((h) => h !== handler);
	}

	/**
	 * @deprecated この引数は非推奨である。 `amflow.GetTickListOptions` を指定する方を利用すべきである。
	 */
	getTickList(begin: number, end: number, callback: (error: Error | null, tickList?: TickList) => void): void;
	/**
	 * 保存された `playlog.Tick` のリスト `[opts.begin, opts.end)` を `playlog.TickList` の形式で取得する。
	 */
	getTickList(opts: GetTickListOptions, callback: (error: Error | null, tickList?: TickList) => void): void;

	getTickList(
		optsOrBegin: number | GetTickListOptions,
		endOrCallback: number | ((error: Error | null, tickList?: TickList) => void),
		callbackOrUndefined?: (error: Error | null, tickList?: TickList) => void
	): void {
		setImmediate(() => {
			let opts: GetTickListOptions;
			let callback: ((error: Error | null, tickList?: TickList) => void) | undefined;
			if (typeof optsOrBegin === "number") {
				// NOTE: optsOrBegin === "number" であれば必ず amflow@2 以前の引数だとみなしてキャストする
				opts = {
					begin: optsOrBegin,
					end: endOrCallback as number
				};
				callback = callbackOrUndefined;
			} else {
				// NOTE: optsOrBegin !== "number" であれば必ず amflow@3 以降の引数だとみなしてキャストする
				opts = optsOrBegin;
				callback = endOrCallback as (error: Error | null, tickList?: TickList) => void;
			}
			if (!callback) {
				throw createError("runtime_error", "Callback is undefined");
			}
			if (this.state !== "open") {
				callback(createError("invalid_status", "Client is not open"), undefined);
				return;
			}
			if (this.permission == null) {
				callback(createError("invalid_status", "Not authenticated"), undefined);
				return;
			}
			if (!this.permission.readTick) {
				callback(createError("permission_error", "Permission denied"), undefined);
				return;
			}
			const tickList = this.store.getTickList(opts);
			if (tickList) {
				callback(null, tickList);
			} else {
				callback(createError("runtime_error", "No tick list"), undefined);
			}
		});
	}

	putStartPoint(startPoint: StartPoint, callback: (err: Error | null) => void): void {
		setImmediate(() => {
			if (this.state !== "open") {
				callback(createError("invalid_status", "Client is not open"));
				return;
			}
			if (this.permission == null) {
				callback(createError("invalid_status", "Not authenticated"));
				return;
			}
			if (!this.permission.writeTick) {
				callback(createError("permission_error", "Permission denied"));
				return;
			}
			try {
				this.store.putStartPoint(startPoint);
			} catch (e) {
				callback(e);
				return;
			}
			callback(null);
		});
	}

	getStartPoint(opts: GetStartPointOptions, callback: (error: Error | null, startPoint?: StartPoint) => void): void {
		setImmediate(() => {
			if (this.state !== "open") {
				callback(createError("invalid_status", "Client is not open"), undefined);
				return;
			}
			if (this.permission == null) {
				callback(createError("invalid_status", "Not authenticated"), undefined);
				return;
			}
			if (!this.permission.readTick) {
				callback(createError("permission_error", "Permission denied"), undefined);
				return;
			}
			const startPoint = this.store.getStartPoint(opts);
			if (startPoint) {
				callback(null, startPoint);
			} else {
				callback(createError("runtime_error", "No start point"), undefined);
			}
		});
	}
	/* eslint-disable @typescript-eslint/no-unused-vars */
	// 未実装の状態のため未使用の lint エラーを無効とする
	putStorageData(key: StorageKey, value: StorageValue, options: any, callback: (err: Error) => void): void {
		setImmediate(() => {
			callback(createError("not_implemented", "Not implemented"));
		});
	}

	getStorageData(keys: StorageReadKey[], callback: (error: Error, values?: StorageData[]) => void): void {
		setImmediate(() => {
			callback(createError("not_implemented", "Not implemented"), undefined);
		});
	}
	/* eslint-enable */

	getState(): AMFlowState {
		return this.state;
	}

	destroy(): void {
		if (this.isDestroyed()) {
			return;
		}
		if (!this.store.isDestroyed()) {
			this.store.sendEventTrigger.remove(this.handleSendEvent, this);
			this.store.sendTickTrigger.remove(this.handleSendTick, this);
			this.store.putStartPointTrigger.remove(this.handlePutStartPoint, this);
		}

		this.store = null!;
		this.permission = null;
		this.tickHandlers = null!;
		this.eventHandlers = null!;
		this.unconsumedEvents = null!;
		this.onPutStartPoint = null!;
	}

	isDestroyed(): boolean {
		return this.store == null;
	}

	dump(): DumpedPlaylog {
		return this.store.dump();
	}

	private handleSendTick(tick: Tick): void {
		this.tickHandlers.forEach((h) => h(tick));
	}

	private handleSendEvent(event: Event): void {
		if (this.eventHandlers.length <= 0) {
			this.unconsumedEvents.push(event);
			return;
		}
		this.eventHandlers.forEach((h) => h(event));
	}

	private handlePutStartPoint(startPoint: StartPoint): void {
		this.onPutStartPoint.fire(startPoint);
	}
}
