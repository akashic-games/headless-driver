import { Permission } from "@akashic/amflow";
import { AMFlowClient } from "./amflow/AMFlowClient";
import { AMFlowClientManager } from "./AMFlowClientManager";
import { Play, PlayStatus } from "./Play";

export interface PlayManagerParameters {
	contentUrl: string;
}

export interface PlayFilter {
	status: PlayStatus;
}

/**
 * Play を管理するマネージャ。
 */
export class PlayManager {
	private amflowClientManager: AMFlowClientManager = new AMFlowClientManager();
	private nextPlayId: number = 0;
	private plays: Play[] = [];

	/**
	 * Play を作成する。
	 * @param params パラメータ
	 */
	async createPlay(params: PlayManagerParameters): Promise<string> {
		const playId = `${this.nextPlayId++}`;
		this.plays.push({
			playId,
			status: "running",
			contentUrl: params.contentUrl,
			createdAt: Date.now(),
			suspendedAt: null
		});
		return playId;
	}

	/**
	 * Play を削除する。
	 * @param playID PlayID
	 */
	async deletePlay(playId: string): Promise<void> {
		const play = this.getPlay(playId);
		if (!play) {
			throw new Error("Play is not found");
		}
		this.amflowClientManager.deleteAllPlayTokens(playId);
		this.amflowClientManager.deleteAMFlowStore(playId);
		this.plays = this.plays.filter(p => p !== play);
	}

	/**
	 * Play を停止する。
	 * @param playID PlayID
	 */
	async suspendPlay(playId: string): Promise<void> {
		const play = this.getPlay(playId);
		if (!play) {
			throw new Error("Play is not found");
		}
		play.status = "suspending";
		play.suspendedAt = Date.now();
		this.amflowClientManager.freezeAMFlowStore(playId);
	}

	/**
	 * 停止中の Play を再開する。
	 * @param playId PlayID
	 */
	async resumePlay(playId: string): Promise<void> {
		const play = this.getPlay(playId);
		if (!play) {
			throw new Error("Play is not found");
		}
		play.status = "running";
		play.suspendedAt = null;
		this.amflowClientManager.unfreezeAMFlowStore(playId);
	}

	/**
	 * Play の情報を取得する。
	 * @param playId PlayID
	 */
	getPlay(playId: string): Play | null {
		return this.plays.find(play => play.playId === playId) || null;
	}

	/**
	 * 現在作成されているすべての Play の情報の一覧を取得する。
	 */
	getAllPlays(): Play[] {
		return this.plays;
	}

	/**
	 * 与えられた引数の条件に一致する Play の情報の一覧を取得する。
	 */
	getPlays(filter: PlayFilter): Play[] {
		return this.plays.filter(play => play.status === filter.status);
	}

	/**
	 * 対象の PlayID の AMFlowClient を作成する。
	 * @param playId PlayID
	 */
	createAMFlow(playId: string): AMFlowClient {
		const play = this.getPlay(playId);
		if (!play) {
			throw new Error("Play is not found");
		}
		if (play.status === "broken") {
			throw new Error("Play is broken");
		}
		return this.amflowClientManager.createAMFlow(playId);
	}

	/**
	 * 対象の Play に紐づく PlayToken を作成する。
	 * @param playId PlayID
	 * @param permission Permission
	 */
	createPlayToken(playId: string, permission: Permission): string {
		const play = this.getPlay(playId);
		if (!play) {
			throw new Error("Play is not found");
		}
		return this.amflowClientManager.createPlayToken(playId, permission);
	}

	/**
	 * 対象の Play に紐づく PlayToken を削除する。
	 * @param playId PlayID
	 * @param token PlayToken
	 */
	deletePlayToken(playId: string, token: string): void {
		this.amflowClientManager.deletePlayToken(playId, token);
	}
}
