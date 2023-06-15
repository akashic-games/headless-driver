import * as http from "http";
import * as path from "path";
import * as url from "url";
import * as getPort from "get-port";
const handler = require("serve-handler"); // eslint-disable-line @typescript-eslint/no-var-requires

declare global {
	// eslint-disable-next-line no-var
	var server: http.Server;

	namespace NodeJS {
		interface ProcessEnv {
			HOST: string;
			PORT: number;
			BASE_URL: string;
			CONTENT_URL_V1: string;
			CONTENT_URL_V2: string;
			CONTENT_URL_V3: string;
			EXT_CONTENT_URL_V1: string;
			EXT_CONTENT_URL_V2: string;
			EXT_CONTENT_URL_V3: string;
			GAME_JSON_URL_V1: string;
			GAME_JSON_URL_V2: string;
			GAME_JSON_URL_V3: string;
			ASSET_BASE_URL_V1: string;
			ASSET_BASE_URL_V2: string;
			ASSET_BASE_URL_V3: string;
			EXT_ASSET_BASE_URL_V1: string;
			EXT_ASSET_BASE_URL_V2: string;
			EXT_ASSET_BASE_URL_V3: string;
			CASCADE_CONTENT_URL_V2: string;
			CASCADE_GAME_JSON_URL_V2: string;
		}
	}
}

export const initialize = async (): Promise<void> => {
	const port = await getPort();
	const host = "::0";
	const baseUrl = `http://[${host}]:${port}`;
	const extPort = port;
	const extHost = "::ffff:7f00:1";
	const extBaseUrl = `http://[${extHost}]:${extPort}`;

	const server = http.createServer((request, response) => {
		handler(request, response, {
			public: path.resolve(__dirname, "fixtures"),
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Credentials": "true"
			}
		});
	});
	server.listen(port, host);

	global.server = server;
	process.env.HOST = host;
	process.env.PORT = port;
	process.env.BASE_URL = baseUrl;
	process.env.CONTENT_URL_V1 = url.resolve(baseUrl, "content-v1/content.json");
	process.env.CONTENT_URL_V2 = url.resolve(baseUrl, "content-v2/content.json");
	process.env.CONTENT_URL_V3 = url.resolve(baseUrl, "content-v3/content.json");
	process.env.EXT_CONTENT_URL_V1 = url.resolve(extBaseUrl, "content-v1/content.json");
	process.env.EXT_CONTENT_URL_V2 = url.resolve(extBaseUrl, "content-v2/content.json");
	process.env.EXT_CONTENT_URL_V3 = url.resolve(extBaseUrl, "content-v3/content.json");
	process.env.GAME_JSON_URL_V1 = url.resolve(baseUrl, "content-v1/game.json");
	process.env.GAME_JSON_URL_V2 = url.resolve(baseUrl, "content-v2/game.json");
	process.env.GAME_JSON_URL_V3 = url.resolve(baseUrl, "content-v3/game.json");
	process.env.ASSET_BASE_URL_V1 = url.resolve(baseUrl, "content-v1/");
	process.env.ASSET_BASE_URL_V2 = url.resolve(baseUrl, "content-v2/");
	process.env.ASSET_BASE_URL_V3 = url.resolve(baseUrl, "content-v3/");
	process.env.EXT_ASSET_BASE_URL_V1 = url.resolve(extBaseUrl, "content-v1/");
	process.env.EXT_ASSET_BASE_URL_V2 = url.resolve(extBaseUrl, "content-v2/");
	process.env.EXT_ASSET_BASE_URL_V3 = url.resolve(extBaseUrl, "content-v3/");
	process.env.CASCADE_CONTENT_URL_V2 = url.resolve(baseUrl, "content-v2/content.cascade.json");
	process.env.CASCADE_GAME_JSON_URL_V2 = url.resolve(baseUrl, "content-v2/game.definitions.json");
};

module.exports = initialize;
