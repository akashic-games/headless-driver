import * as path from "path";

declare global {
	// グローバルスコープのため var を許容
	// eslint-disable-next-line no-var
	var trustedFunctions: TrustedFunctions;
}

interface TrustedFunctions {
	engineFiles: () => any | undefined;
}

describe("engineFiles", () => {
	afterEach(() => {
		jest.resetAllMocks();
	});

	it("can require engineFiles", async () => {
		let engineFiles: any;
		let akashicEngine: any;
		let gameDriver: any;
		let pdi: any;
		jest.isolateModules(() => {
			/* eslint-disable @typescript-eslint/no-require-imports */
			akashicEngine = require("engine-files-v3").akashicEngine;
			gameDriver = require("engine-files-v3").gameDriver;
			pdi = require("engine-files-v3").pdi;
			engineFiles = require("../engineFiles");
			/* eslint-enable @typescript-eslint/no-require-imports */
		});

		expect(engineFiles.akashicEngine).toBe(akashicEngine);
		expect(engineFiles.gameDriver).toBe(gameDriver);
		expect(engineFiles.pdi).toBe(pdi);
	});

	it("can override engineFiles via trustedFunctions (absolute path)", async () => {
		global.trustedFunctions = {
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			engineFiles: () => require(path.join(__dirname, "fixtures", "engineFiles.dummy.js"))
		};

		let engineFiles: any;
		jest.isolateModules(() => {
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			engineFiles = require("../engineFiles");
		});

		expect(engineFiles.akashicEngine).toBe("akashic-engine");
		expect(engineFiles.gameDriver).toBe("game-driver");
		expect(engineFiles.pdi).toBe("pdi-types");

		global.trustedFunctions = undefined as any;
	});
});
