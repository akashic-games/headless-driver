import { Permission } from "@akashic/amflow";
import { AMFlowClient } from "./amflow/AMFlowClient";
import { AMFlowStore } from "./amflow/AMFlowStore";

export class AMFlowClientManager {
	/**
	 * PlayId と AMFlowStore を紐付けるマップ情報。
	 */
	private storeMap: Map<string, AMFlowStore> = new Map();

	/**
	 * 対象の PlayID の AMFlowClient を作成する。
	 * @param playId PlayID
	 */
	createAMFlow(playId: string): AMFlowClient {
		let store: AMFlowStore = this.storeMap.get(playId);
		if (!store) {
			store = this.createAMFlowStore(playId);
		}

		const client = new AMFlowClient(playId, store);
		return client;
	}

	/**
	 * 対象の Play に紐づく PlayToken を作成する。
	 * @param playId PlayID
	 * @param permission Permission
	 */
	createPlayToken(playId: string, permission: Permission): string {
		let store = this.storeMap.get(playId);
		if (!store) {
			store = this.createAMFlowStore(playId);
		}
		return store.createPlayToken(permission);
	}

	/**
	 * 対象の Play に紐づく PlayToken を削除する。
	 * @param playId PlayID
	 * @param token PlayToken
	 */
	deletePlayToken(playId: string, token: string): void {
		let store = this.storeMap.get(playId);
		if (!store) {
			store = this.createAMFlowStore(playId);
		}
		return store.deletePlayToken(token);
	}

	/**
	 * 対象の Play に紐づく PlayToken を認証する。
	 * @param playId PlayID
	 * @param token PlayToken
	 * @param revoke 対象の PlayToken を revoke するかどうか
	 */
	authenticatePlayToken(playId: string, token: string, revoke?: boolean): Permission | null {
		let store = this.storeMap.get(playId);
		if (!store) {
			store = this.createAMFlowStore(playId);
		}
		return store.authenticate(token, revoke);
	}

	/**
	 * 対象の Play に紐づく PlayToken をすべて削除する。
	 * @param playId PlayID
	 */
	deleteAllPlayTokens(playId: string): void {
		let store = this.storeMap.get(playId);
		if (!store) {
			store = this.createAMFlowStore(playId);
		}
		return store.deleteAllPlayTokens();
	}

	/**
	 * 対象の PlayID の AMFlowStore を削除する。
	 * @param playId PlayID
	 * @param permission Permission
	 */
	deleteAMFlowStore(playId: string): void {
		const store = this.storeMap.get(playId);
		if (store) {
			store.destroy();
		}
		this.storeMap.delete(playId);
	}

	/**
	 * 対象の PlayID に対する AMFlowStore を停止する。
	 * @param playId PlayID
	 */
	suspendAMFlowStore(playId: string): void {
		const store = this.storeMap.get(playId);
		if (store) {
			store.suspend();
		}
	}

	/**
	 * 対象の PlayID に対する AMFlowStore を再開する。
	 * @param playId PlayID
	 */
	resumeAMFlowStore(playId: string): void {
		const store = this.storeMap.get(playId);
		if (store) {
			store.resume();
		}
	}

	private createAMFlowStore(playId: string): AMFlowStore {
		let store: AMFlowStore = this.storeMap.get(playId);
		if (!store) {
			store = new AMFlowStore(playId);
			this.storeMap.set(playId, store);
		}
		return store;
	}
}
