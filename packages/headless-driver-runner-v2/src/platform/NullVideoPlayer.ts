import { akashicEngine as g } from "@akashic/engine-files";

export class NullVideoplayerAsset extends g.VideoPlayer {
	isDummy(): boolean {
		return true;
	}
}
