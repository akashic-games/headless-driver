import type { Server } from "http";

declare global {
	// eslint-disable-next-line no-var
	var server: Server;
}

module.exports = () => {
	global.server.close();
};
