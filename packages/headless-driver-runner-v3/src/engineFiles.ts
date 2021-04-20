import { akashicEngine, gameDriver, pdi } from "@akashic/engine-files";

const e = typeof trustedFunctions !== "undefined" && trustedFunctions.engineFiles();

if (e) {
	(akashicEngine as any) = e.akashicEngine;
	(gameDriver as any) = e.gameDriver;
	(pdi as any) = e.pdi;
}

export { akashicEngine, gameDriver, pdi };
