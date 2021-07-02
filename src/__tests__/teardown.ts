import * as http from "http";

declare global {
	namespace NodeJS {
		interface Global {
			server: http.Server;
		}
	}
}

module.exports = () => {
	global.server.close();
};
