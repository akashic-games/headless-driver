import { Permission } from "@akashic/amflow";
import { Play } from "./Play";
import { AMFlowClientManager } from "./AMFlowClientManager";
import { getSystemLogger } from "../Logger";
import { AMFlowClient } from "./amflow/AMFlowClient";

export interface PlayManagerParameters {
	contentUrl: string;
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
		try {
			const playId = `${this.nextPlayId++}`;
			this.plays.push({
				playId,
				contentUrl: params.contentUrl
			});
			return playId;
		} catch (e) {
			getSystemLogger().error(e);
		}
	}

	/**
	 * Play を停止する。
	 * @param playID PlayID
	 */
	async stopPlay(playId: string): Promise<void> {
		const play = this.getPlay(playId);

		if (!play) {
			throw new Error("Play is not found");
		}

		this.amflowClientManager.deleteAllPlayTokens(playId);
		this.amflowClientManager.deleteAMFlowStore(playId);
		this.plays = this.plays.filter(p => p !== play);
	}

	/**
	 * Play の情報を取得する。
	 * @param playId PlayID
	 */
	getPlay(playId: string): Play {
		return this.plays.find(play => play.playId === playId);
	}

	/**
	 * 現在作成されている Play の情報の一覧を取得する。
	 */
	getPlays(): Play[] {
		return this.plays;
	}

	/**
	 * 対象の PlayID の AMFlowClient を作成する。
	 * @param playId PlayID
	 */
	createAMFlow(playId: string): AMFlowClient {
		return this.amflowClientManager.createAMFlow(playId);
	}

	/**
	 * 対象の Play に紐づく PlayToken を作成する。
	 * @param playId PlayID
	 * @param permission Permission
	 */
	createPlayToken(playId: string, permission: Permission): string {
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
