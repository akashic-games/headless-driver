// 環境に応じて適当な engineFiles を返すモジュール。
// 通常の engine-files と同様に `import { akashicEngine, gameDriver, pdi } from "./engineFiles"` という形で呼び出せる。
// headless-driver-runner-v3 内では基本的に本モジュールを介して engine-files の読み込みを行うこと。
//
// NOTE: このモジュールは現実装において NodeVM のサンドボックスの内側と外側の両方から require される。
// サンドボックスの内側ではグローバル関数 trustedFunctions.engineFiles() が存在するため、下の (1) のパスから engine-files を読みようにする。
// 一方、このモジュール自体が NodeVM の外側から require されるケースも存在するため、下の (2) のパスから engine-files を読み込むようにしている。

import { akashicEngine, gameDriver, pdi } from "@akashic/engine-files";

let e: any;
if (typeof trustedFunctions !== "undefined") {
	// (1)
	// NodeVM の中であれば
	e = trustedFunctions.engineFiles();
} else {
	// (2)
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
