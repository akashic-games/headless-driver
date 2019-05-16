import { loadFile } from "@akashic/headless-driver-runner";
import { RunnerManager } from "../../runner/RunnerManager";

const gameJsonUrlV1 = process.env.GAME_JSON_URL_V1;
const gameJsonUrlV2 = process.env.GAME_JSON_URL_V2;
const assetBaseUrlV1 = process.env.ASSET_BASE_URL_V1;
const assetBaseUrlV2 = process.env.ASSET_BASE_URL_V2;
const cascadeGameJsonUrlV2 = process.env.CASCADE_GAME_JSON_URL_V2;

export class MockRunnerManager extends RunnerManager {
	protected async resolveContent(contentUrl: string): Promise<any> {
		const config = await loadFile<any>(contentUrl, { json: true });
		if (config.content_url === "v1_content_url") {
			config.content_url = gameJsonUrlV1;
		} else if (config.content_url === "v2_content_url") {
			config.content_url = gameJsonUrlV2;
		} else if (config.content_url === "v2_content_cascade_url") {
			config.content_url = cascadeGameJsonUrlV2;
		}
		if (config.asset_base_url === "v1_asset_base_url") {
			config.asset_base_url = assetBaseUrlV1;
		} else if (config.asset_base_url === "v2_asset_base_url") {
			config.asset_base_url = assetBaseUrlV2;
		}
		return config;
	}
}
