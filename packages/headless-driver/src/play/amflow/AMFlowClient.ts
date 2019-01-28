import { Permission, StartPoint, AMFlow, GetStartPointOptions } from "@akashic/amflow";
import { Tick, TickList, Event, StorageData, StorageKey, StorageValue, StorageReadKey } from "@akashic/playlog";
import { getSystemLogger } from "../../Logger";
import { AMFlowStore } from "./AMFlowStore";

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
					callback(new Error("Invalid PlayID"));
				} else {
					callback();
				}
			});
		}
	}

	close(callback?: (error?: Error) => void): void {
		getSystemLogger().info("AMFlowClient#close()");
		if (this.state !== "open") {
			callback(new Error("Client is not open"));
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
				callback(new Error("Client is not open"), null);
				return;
			}
			const permission = this.store.authenticate(token);
			this.permission = permission;
			getSystemLogger().info("AMFlowClient#authenticate()", this.playId, token, permission);

			if (permission) {
				callback(null, permission);
			} else {
				callback(new Error("Invalid playToken"), null);
			}
		});
	}

	sendTick(tick: Tick): void {
		if (this.state !== "open") {
			throw new Error("Client is not open");
		}
		if (!this.permission.writeTick) {
			throw new Error("Permission denied");
		}
		this.store.sendTick(tick);
	}

	onTick(handler: (tick: Tick) => void): void {
		if (this.state !== "open") {
			throw new Error("Client is not open");
		}
		if (!this.permission.subscribeTick) {
			throw new Error("Permission denied");
		}
		this.tickHandlers.push(handler);
	}

	offTick(handler: (tick: Tick) => void): void {
		if (this.state !== "open") {
			throw new Error("Client is not open");
		}
		this.tickHandlers = this.tickHandlers.filter(h => h !== handler);
	}

	sendEvent(event: Event): void {
		if (this.state !== "open") {
			throw new Error("Client is not open");
		}
		if (!this.permission.sendEvent) {
			throw new Error("Permission denied");
		}
		// Max Priority
		event[1] = Math.min(event[1], this.permission.maxEventPriority);
		this.store.sendEvent(event);
	}

	onEvent(handler: (event: Event) => void): void {
		if (this.state !== "open") {
			throw new Error("Client is not open");
		}
		if (!this.permission.subscribeEvent) {
			throw new Error("Permission denied");
		}
		this.eventHandlers.push(handler);
	}

	offEvent(handler: (event: Event) => void): void {
		if (this.state !== "open") {
			throw new Error("Client is not open");
		}
		this.eventHandlers = this.eventHandlers.filter(h => h !== handler);
	}

	getTickList(from: number, to: number, callback: (error: Error, tickList: TickList) => void): void {
		setImmediate(() => {
			if (this.state !== "open") {
				callback(new Error("Client is not open"), null);
				return;
			}
			if (!this.permission.readTick) {
				callback(new Error("Permission denied"), null);
				return;
			}
			const tickList = this.store.getTickList(from, to);
			if (tickList) {
				callback(null, tickList);
			} else {
				callback(new Error("No tick list"), null);
			}
		});
	}

	putStartPoint(startPoint: StartPoint, callback: (err: Error) => void): void {
		setImmediate(() => {
			if (this.state !== "open") {
				callback(new Error("Client is not open"));
				return;
			}
			if (!this.permission.writeTick) {
				callback(new Error("Permission denied"));
				return;
			}
			this.store.putStartPoint(startPoint);
			callback(null);
		});
	}

	getStartPoint(opts: GetStartPointOptions, callback: (error: Error, startPoint: StartPoint) => void): void {
		setImmediate(() => {
			if (this.state !== "open") {
				callback(new Error("Client is not open"), null);
				return;
			}
			if (!this.permission.readTick) {
				callback(new Error("Permission denied"), null);
				return;
			}
			const startPoint = this.store.getStartPoint(opts);
			if (startPoint) {
				callback(null, startPoint);
			} else {
				callback(new Error("No start point"), null);
			}
		});
	}

	putStorageData(key: StorageKey, value: StorageValue, options: any, callback: (err: Error) => void): void {
		setImmediate(() => {
			callback(new Error("Not implemented"));
		});
	}

	getStorageData(keys: StorageReadKey[], callback: (error: Error, values: StorageData[]) => void): void {
		setImmediate(() => {
			callback(new Error("Not implemented"), null);
		});
	}

	getState(): AMFlowState {
		return this.state;
	}

	destroy(): void {
		this.store.sendEventTrigger.remove(this.onEventSended, this);
		this.store.sendTickTrigger.remove(this.onTickSended, this);
		this.store = null;
		this.permission = null;
		this.tickHandlers = null;
		this.eventHandlers = null;
	}

	private onTickSended(tick: Tick): void {
		this.tickHandlers.forEach(h => h(tick));
	}

	private onEventSended(event: Event): void {
		this.eventHandlers.forEach(h => h(event));
	}
}
