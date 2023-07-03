import type { NodeVM } from "vm2";
import { RunnerManager } from "../../runner/RunnerManager";
import { loadFile } from "../../utils";

const gameJsonUrlV1 = process.env.GAME_JSON_URL_V1;
const gameJsonUrlV2 = process.env.GAME_JSON_URL_V2;
const gameJsonUrlV3 = process.env.GAME_JSON_URL_V3;
const assetBaseUrlV1 = process.env.ASSET_BASE_URL_V1;
const assetBaseUrlV2 = process.env.ASSET_BASE_URL_V2;
const assetBaseUrlV3 = process.env.ASSET_BASE_URL_V3;
const cascadeGameJsonUrlV2 = process.env.CASCADE_GAME_JSON_URL_V2;

export class MockRunnerManager extends RunnerManager {
	// NOTE: 外部から参照できるようにメンバ変数に格納しておく (`createRunner()` 呼び出しタイミングで格納される)
	nvm: NodeVM | null = null;

	protected async resolveContent(contentUrl: string): Promise<any> {
		const config = JSON.parse(await loadFile(contentUrl, "utf-8"));
		if (config.content_url === "v1_content_url") {
			config.content_url = gameJsonUrlV1;
		} else if (config.content_url === "v2_content_url") {
			config.content_url = gameJsonUrlV2;
		} else if (config.content_url === "v3_content_url") {
			config.content_url = gameJsonUrlV3;
		} else if (config.content_url === "v2_content_cascade_url") {
			config.content_url = cascadeGameJsonUrlV2;
		}
		if (config.asset_base_url === "v1_asset_base_url") {
			config.asset_base_url = assetBaseUrlV1;
		} else if (config.asset_base_url === "v2_asset_base_url") {
			config.asset_base_url = assetBaseUrlV2;
		} else if (config.asset_base_url === "v3_asset_base_url") {
			config.asset_base_url = assetBaseUrlV3;
		}
		return config;
	}

	protected createVm(trusted?: boolean): NodeVM {
		const nvm = super.createVm(trusted);
		this.nvm = nvm;
		return nvm;
	}
}
