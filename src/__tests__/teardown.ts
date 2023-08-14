import type { Server } from "http";

declare global {
	// eslint-disable-next-line no-var
	var server: Server;
}

export default (): void => {
	global.server.close();
};
