import { setSystemLogger } from "../Logger";
import { PlayManager } from "../play/PlayManager";
import { SilentLogger } from "./helpers/SilentLogger";

setSystemLogger(new SilentLogger());

const contentUrl = process.env.CONTENT_URL_V3!;

describe("PlayManager の単体テスト", () => {
	it("Play の管理ができる", async () => {
		const playManager = new PlayManager();
		const playId1 = await playManager.createPlay({ contentUrl });
		const playId2 = await playManager.createPlay({ contentUrl });
		const playId3 = await playManager.createPlay({ contentUrl });

		let playIds = playManager.getAllPlays().map((play) => play.playId);
		expect(playIds).toEqual([playId1, playId2, playId3]);

		playManager.suspendPlay(playId1);

		// すべてのPlay
		playIds = playManager.getAllPlays().map((play) => play.playId);
		expect(playIds).toEqual([playId1, playId2, playId3]);
		// running の Play
		playIds = playManager.getPlays({ status: "running" }).map((play) => play.playId);
		expect(playIds).toEqual([playId2, playId3]);
		// suspend の Play
		playIds = playManager.getPlays({ status: "suspending" }).map((play) => play.playId);
		expect(playIds).toEqual([playId1]);

		playManager.deletePlay(playId2);

		// すべてのPlay
		playIds = playManager.getAllPlays().map((play) => play.playId);
		expect(playIds).toEqual([playId1, playId3]);
		// running の Play
		playIds = playManager.getPlays({ status: "running" }).map((play) => play.playId);
		expect(playIds).toEqual([playId3]);
		// suspend の Play
		playIds = playManager.getPlays({ status: "suspending" }).map((play) => play.playId);
		expect(playIds).toEqual([playId1]);

		playManager.resumePlay(playId1);

		// すべてのPlay
		playIds = playManager.getAllPlays().map((play) => play.playId);
		expect(playIds).toEqual([playId1, playId3]);
		// running の Play
		playIds = playManager.getPlays({ status: "running" }).map((play) => play.playId);
		expect(playIds).toEqual([playId1, playId3]);
		// suspend の Play
		playIds = playManager.getPlays({ status: "suspending" }).map((play) => play.playId);
		expect(playIds).toEqual([]);
	});
});
