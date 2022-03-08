import { akashicEngine as g } from "aev1";

export class NullVideoplayerAsset extends g.VideoPlayer {
	isDummy(): boolean {
		return true;
	}
}
