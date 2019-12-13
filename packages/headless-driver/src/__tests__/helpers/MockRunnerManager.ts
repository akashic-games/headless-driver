import { LoadFileOption } from "@akashic/headless-driver-runner";
import { NodeVM } from "vm2";
import { RunnerManager } from "../../runner/RunnerManager";
import { loadFile } from "../../utils";

const gameJsonUrlV1 = process.env.GAME_JSON_URL_V1;
const gameJsonUrlV2 = process.env.GAME_JSON_URL_V2;
const assetBaseUrlV1 = process.env.ASSET_BASE_URL_V1;
const assetBaseUrlV2 = process.env.ASSET_BASE_URL_V2;
const cascadeGameJsonUrlV2 = process.env.CASCADE_GAME_JSON_URL_V2;

export class MockRunnerManager extends RunnerManager {
	nvm: NodeVM;

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

	protected createVm(allowedUrls: (string | RegExp)[] | null): NodeVM {
		this.nvm = new NodeVM({
			sandbox: {
				trustedFunctions: {
					loadFile: async (targetUrl: string, opt?: LoadFileOption) => {
						if (allowedUrls != null) {
							const isAllowedUrl = allowedUrls.some(u => {
								if (typeof u === "string") {
									return targetUrl.startsWith(u);
								} else if (u instanceof RegExp) {
									return u.test(targetUrl);
								}
								return false;
							});
							if (!isAllowedUrl) {
								throw new Error(`Not allowed to read this URL. ${targetUrl}`);
							}
						}
						return await loadFile(targetUrl, opt);
					}
				}
			},
			require: {
				context: "sandbox",
				external: true,
				builtin: [] // 何も設定しない。require() が必要な場合は sandboxの外側で実行される trustedFunctions で定義する。
			}
		});
		return this.nvm;
	}
}
