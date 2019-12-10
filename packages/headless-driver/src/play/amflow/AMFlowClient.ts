import { AMFlow, GetStartPointOptions, Permission, StartPoint } from "@akashic/amflow";
import { Event, StorageData, StorageKey, StorageReadKey, StorageValue, Tick, TickList } from "@akashic/playlog";
import { getSystemLogger } from "../../Logger";
import { AmflowDump, AMFlowStore } from "./AMFlowStore";
import { createError } from "./ErrorFactory";

export type AMFlowState = "connecting" | "open" | "closing" | "closed";

/**
 * Runnerと1対1で対応するAMFlow実装。
 */
export class AMFlowClient implements AMFlow {
	playId: string;

	protected state: AMFlowState = "connecting";
	private store: AMFlowStore;

	private permission: Permission = null;
	private tickHandlers: ((tick: Tick) => void)[] = [];
	private eventHandlers: ((event: Event) => void)[] = [];
	private unconsumedEvents: Event[] = [];

	constructor(playId: string, store: AMFlowStore) {
		this.playId = playId;
		this.store = store;
	}

	open(playId: string, callback?: (error?: Error) => void): void {
		getSystemLogger().info("AMFlowClient#open()", playId);

		this.store.sendEventTrigger.add(this.onEventSended, this);
		this.store.sendTickTrigger.add(this.onTickSended, this);
		this.state = "open";

		if (callback) {
			setImmediate(() => {
				if (this.playId !== playId) {
					callback(createError("runtime_error", "Invalid PlayID"));
				} else {
					callback();
				}
			});
		}
	}

	close(callback?: (error?: Error) => void): void {
		getSystemLogger().info("AMFlowClient#close()");
		if (this.state !== "open") {
			callback(createError("invalid_status", "Client is not open"));
			return;
		}

		this.destroy();
		this.state = "closed";

		if (callback) {
			setImmediate(() => callback());
		}
	}

	authenticate(token: string, callback: (error: Error, permission: Permission) => void): void {
		setImmediate(() => {
			if (this.state !== "open") {
				callback(createError("invalid_status", "Client is not open"), null);
				return;
			}
			let permission: Permission;
			try {
				permission = this.store.authenticate(token);
			} catch (e) {
				callback(e, null);
				return;
			}
			this.permission = permission;
			getSystemLogger().info("AMFlowClient#authenticate()", this.playId, token, permission);
			if (permission) {
				callback(null, permission);
			} else {
				callback(createError("invalid_status", "Invalid playToken"), null);
			}
		});
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
		this.tickHandlers = this.tickHandlers.filter(h => h !== handler);
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
		event[1] = Math.min(event[1], this.permission.maxEventPriority);
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
			this.eventHandlers.forEach(h => this.unconsumedEvents.forEach(ev => h(ev)));
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
		this.eventHandlers = this.eventHandlers.filter(h => h !== handler);
	}

	getTickList(from: number, to: number, callback: (error: Error, tickList: TickList) => void): void {
		setImmediate(() => {
			if (this.state !== "open") {
				callback(createError("invalid_status", "Client is not open"), null);
				return;
			}
			if (this.permission == null) {
				callback(createError("invalid_status", "Not authenticated"), null);
				return;
			}
			if (!this.permission.readTick) {
				callback(createError("permission_error", "Permission denied"), null);
				return;
			}
			const tickList = this.store.getTickList(from, to);
			if (tickList) {
				callback(null, tickList);
			} else {
				callback(createError("runtime_error", "No tick list"), null);
			}
		});
	}

	putStartPoint(startPoint: StartPoint, callback: (err: Error) => void): void {
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

	getStartPoint(opts: GetStartPointOptions, callback: (error: Error, startPoint: StartPoint) => void): void {
		setImmediate(() => {
			if (this.state !== "open") {
				callback(createError("invalid_status", "Client is not open"), null);
				return;
			}
			if (this.permission == null) {
				callback(createError("invalid_status", "Not authenticated"), null);
				return;
			}
			if (!this.permission.readTick) {
				callback(createError("permission_error", "Permission denied"), null);
				return;
			}
			const startPoint = this.store.getStartPoint(opts);
			if (startPoint) {
				callback(null, startPoint);
			} else {
				callback(createError("runtime_error", "No start point"), null);
			}
		});
	}

	putStorageData(key: StorageKey, value: StorageValue, options: any, callback: (err: Error) => void): void {
		setImmediate(() => {
			callback(createError("not_implemented", "Not implemented"));
		});
	}

	getStorageData(keys: StorageReadKey[], callback: (error: Error, values: StorageData[]) => void): void {
		setImmediate(() => {
			callback(createError("not_implemented", "Not implemented"), null);
		});
	}

	getState(): AMFlowState {
		return this.state;
	}

	destroy(): void {
		if (this.isDestroyed()) {
			return;
		}
		if (!this.store.isDestroyed()) {
			this.store.sendEventTrigger.remove(this.onEventSended, this);
			this.store.sendTickTrigger.remove(this.onTickSended, this);
		}
		this.store = null;
		this.permission = null;
		this.tickHandlers = null;
		this.eventHandlers = null;
		this.unconsumedEvents = null;
	}

	isDestroyed(): boolean {
		return this.store == null;
	}

	dump(): AmflowDump {
		return this.store.dump();
	}

	private onTickSended(tick: Tick): void {
		this.tickHandlers.forEach(h => h(tick));
	}

	private onEventSended(event: Event): void {
		if (this.eventHandlers.length <= 0) {
			this.unconsumedEvents.push(event);
			return;
		}
		this.eventHandlers.forEach(h => h(event));
	}
}
