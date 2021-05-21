/**
 * 環境に応じて適当な engineFiles を返すモジュール。
 * 通常の engine-files と同様に `import { akashicEngine, gameDriver, pdi } from "./engineFiles"` という形で呼び出せる。
 * headless-driver-runner-v3 内では基本的に本モジュールを介して engine-files の読み込みを行うこと。
 */

import { akashicEngine, gameDriver, pdi } from "@akashic/engine-files";

let e: any;
if (typeof trustedFunctions !== "undefined") {
	// NodeVM の中であれば
	e = trustedFunctions.engineFiles();
} else {
	// NodeVM 起動前もしくはその他環境であれば
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	e = require("./requireEngineFiles").requireEngineFiles();
}

if (e) {
	(akashicEngine as any) = e.akashicEngine;
	(gameDriver as any) = e.gameDriver;
	(pdi as any) = e.pdi;
}

export { akashicEngine, gameDriver, pdi };
