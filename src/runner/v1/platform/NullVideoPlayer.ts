import { akashicEngine as g } from "engine-files-v1";

export class NullVideoplayerAsset extends g.VideoPlayer {
	isDummy(): boolean {
		return true;
	}
}
