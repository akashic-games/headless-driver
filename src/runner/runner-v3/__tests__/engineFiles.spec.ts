import * as path from "path";
import { akashicEngine, gameDriver, pdi } from "aev3";

declare global {
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
		jest.isolateModules(() => {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			engineFiles = require("../engineFiles");
		});

		expect(engineFiles.akashicEngine).toBe(akashicEngine);
		expect(engineFiles.gameDriver).toBe(gameDriver);
		expect(engineFiles.pdi).toBe(pdi);
	});

	it("can override engineFiles via trustedFunctions (absolute path)", async () => {
		global.trustedFunctions = {
			engineFiles: () => require(path.join(__dirname, "fixtures", "engineFiles.dummy.js"))
		};

		let engineFiles: any;
		jest.isolateModules(() => {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			engineFiles = require("../engineFiles");
		});

		expect(engineFiles.akashicEngine).toBe("akashic-engine");
		expect(engineFiles.gameDriver).toBe("game-driver");
		expect(engineFiles.pdi).toBe("pdi-types");

		global.trustedFunctions = undefined as any;
	});
});
