import type { Server } from "http";

declare global {
	var server: Server;
}

export default (): void => {
	global.server.close();
};
