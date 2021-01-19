import { Permission } from "@akashic/amflow";
import { AMFlowClient } from "./amflow/AMFlowClient";
import { DumpedPlaylog } from "./amflow/AMFlowStore";
import { AMFlowClientManager } from "./AMFlowClientManager";
import { ContentLocation } from "./Content";
import { Play, PlayStatus } from "./Play";

export type PlayManagerParameters = ContentLocation;

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
	 * @param playLocation パラメータ
	 */
	async createPlay(playLocation: PlayManagerParameters, playlog?: DumpedPlaylog): Promise<string> {
		const playId = `${this.nextPlayId++}`;
		this.plays.push({
			playId,
			status: "running",
			createdAt: Date.now(),
			lastSuspendedAt: null,
			...playLocation
		});
		if (playlog && playlog.tickList) {
			const amflow = this.createAMFlow(playId);
			const activePermission = {
				readTick: true,
				writeTick: true,
				sendEvent: true,
				subscribeEvent: true,
				subscribeTick: true,
				maxEventPriority: 2
			};
			const token = this.createPlayToken(playId, activePermission);

			// TODO: プレイ生成時に AMFlowStore 生成し playlog を渡して初期化できるようにし、 AMFlowClient 経由で playlog を渡さず済むようにする
			await new Promise<void>((resolve, reject) => amflow.open(playId, (e: Error | null) => (e ? reject(e) : resolve())));
			await new Promise<void>((resolve, reject) => amflow.authenticate(token, (e: Error | null) => (e ? reject(e) : resolve())));
			await new Promise<void>((resolve, reject) =>
				amflow.putStartPoint(playlog.startPoints[0], (e: Error | null) => (e ? reject(e) : resolve()))
			);
			amflow.setTickList(playlog.tickList);
		}
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
		this.plays = this.plays.filter((p) => p !== play);
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
		play.lastSuspendedAt = Date.now();
		this.amflowClientManager.suspendAMFlowStore(playId);
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
		play.lastSuspendedAt = null;
		this.amflowClientManager.resumeAMFlowStore(playId);
	}

	/**
	 * Play の情報を取得する。
	 * @param playId PlayID
	 */
	getPlay(playId: string): Play | null {
		return this.plays.find((play) => play.playId === playId) || null;
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
		return this.plays.filter((play) => play.status === filter.status);
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
