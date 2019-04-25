import { Permission } from "@akashic/amflow";
import { sha256 } from "js-sha256";
import { AMFlowClient } from "./amflow/AMFlowClient";
import { AMFlowStore } from "./amflow/AMFlowStore";

export class AMFlowClientManager {
	/**
	 * PlayId と AMFlowStore を紐付けるマップ情報。
	 */
	private storeMap: Map<string, AMFlowStore> = new Map();
	/**
	 * PlayId と PlayToken, Permission を紐付けるマップ情報。
	 */
	private playTokenMap: { [playId: string]: Map<string, Permission> } = {};

	/**
	 * 対象の PlayID の AMFlowClient を作成する。
	 * @param playId PlayID
	 */
	createAMFlow(playId: string): AMFlowClient {
		let store: AMFlowStore = this.storeMap.get(playId);
		if (!store) {
			store = new AMFlowStore(playId, this);
			this.storeMap.set(playId, store);
		}

		const client = new AMFlowClient(playId, store);
		return client;
	}

	/**
	 * 対象の Play に紐づく PlayToken を作成する。
	 * @param playId PlayID
	 */
	createPlayToken(playId: string, permission: Permission): string {
		const str = this.createRandomString(10);
		const token = sha256(str);
		if (this.playTokenMap[playId] == null) {
			this.playTokenMap[playId] = new Map();
		}
		this.playTokenMap[playId].set(token, permission);
		return token;
	}

	/**
	 * 対象の Play に紐づく PlayToken を削除する。
	 * @param playId PlayID
	 * @param token PlayToken
	 */
	deletePlayToken(playId: string, token: string): void {
		if (this.playTokenMap[playId] != null) {
			this.playTokenMap[playId].delete(token);
		}
	}

	/**
	 * 対象の Play に紐づく PlayToken を認証する。
	 * @param playId PlayID
	 * @param token PlayToken
	 * @param revoke 対象の PlayToken を revoke するかどうか
	 */
	authenticatePlayToken(playId: string, token: string, revoke?: boolean): Permission | null {
		const map = this.playTokenMap[playId];
		if (map) {
			const permission = map.get(token);
			if (permission) {
				if (revoke) {
					this.playTokenMap[playId].delete(token);
					delete this.playTokenMap[playId];
				}
				return permission;
			}
		}
		return null;
	}

	/**
	 * 対象の Play に紐づく PlayToken をすべて削除する。
	 * @param playId PlayID
	 */
	deleteAllPlayTokens(playId: string): void {
		const map = this.playTokenMap[playId];
		if (map) {
			map.clear();
			delete this.playTokenMap[playId];
		}
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
	 * 対象の PlayID に対する AMFlowStore をフリーズする。
	 * @param playId PlayID
	 */
	freezeAMFlowStore(playId: string): void {
		const store = this.storeMap.get(playId);
		if (store) {
			store.freeze();
		}
	}

	/**
	 * 対象の PlayID に対する AMFlowStore のフリーズを解除する。
	 * @param playId PlayID
	 */
	unfreezeAMFlowStore(playId: string): void {
		const store = this.storeMap.get(playId);
		if (store) {
			store.unfreeze();
		}
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
