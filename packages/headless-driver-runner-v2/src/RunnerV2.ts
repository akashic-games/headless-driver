import { akashicEngine as g, gameDriver as gdr } from "@akashic/engine-files";
import { Runner } from "@akashic/headless-driver-runner";
import { NodeVM, NodeVMOptions, VMScript } from "vm2";

export type RunnerV2Game = g.Game;

export class RunnerV2 extends Runner {
	static SANDBOX_PATH: string = `${__dirname}/RunnerV2Sandbox.js`;
	private driver: gdr.GameDriver;

	get engineVersion(): string {
		return "2";
	}

	// NOTE: 暫定的にデバッグ用として g.Game を返している
	async start(): Promise<RunnerV2Game | null> {
		const nvmOpt: NodeVMOptions = {
			console: "inherit",
			sandbox: {},
			require: {
				context: "sandbox",
				external: true,
				builtin: ["*"]
			}
		};

		const nvm = new NodeVM(nvmOpt);
		let game: RunnerV2Game | null = null;
		try {
			const script = new VMScript(`module.exports = async function(runner) {
				const Sandbox = require("./RunnerV2Sandbox");
				const sandbox = new Sandbox.RunnerSandbox(runner);
				return await sandbox.start();
			}`);

			const funcCallbackInSandbox = nvm.run(script, RunnerV2.SANDBOX_PATH);
			const callbackObj = await funcCallbackInSandbox(this);
			this.driver = callbackObj.driver;
			game = callbackObj.game;
		} catch (e) {
			this.onError(e);
		}

		return game;
	}

	stop(): void {
		if (this.driver) {
			this.driver.stopGame();
			this.driver = null;
		}
	}

	changeGameDriverState(param: gdr.GameDriverInitializeParameterObject): Promise<void> {
		return new Promise((resolve, reject) => {
			if (!this.driver) {
				reject(new Error("Game is not started"));
				return;
			}
			this.driver.changeState(param, err => (err ? reject(err) : resolve()));
		});
	}

	onSended(data: any): void {
		this.sendToExternalTrigger.fire(data);
	}

	onErrorHandler(e: any, driver?: gdr.GameDriver): void {
		super.onError(e);
	}
}
