import { akashicEngine as g } from "aev2";

export class NullVideoplayerAsset extends g.VideoPlayer {
	isDummy(): boolean {
		return true;
	}
}
