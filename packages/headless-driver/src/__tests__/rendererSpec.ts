import * as fs from "fs";
import * as path from "path";
import { RunnerV3, RunnerV3Game } from "@akashic/headless-driver-runner-v3";
import * as pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import * as ExecuteVmScriptV3 from "../ExecuteVmScriptV3";
import { setSystemLogger } from "../Logger";
import { PlayManager } from "../play/PlayManager";
import { activePermission } from "./constants";
import { MockRunnerManager } from "./helpers/MockRunnerManager";
import { SilentLogger } from "./helpers/SilentLogger";

setSystemLogger(new SilentLogger());

beforeAll(() => {
	jest.spyOn(ExecuteVmScriptV3, "getFilePath").mockReturnValue(path.resolve(__dirname, "../../lib/", "ExecuteVmScriptV3.js"));
});

describe("コンテンツのレンダリングテスト", () => {
	/**
	 * コンテンツの実行後数フレームまでの描画差異を確認するためのテスト。
	 * 正解データは <game.jsonのディレクトリ>/expected 以下にフレームごとに昇順で保存する。
	 * このテストによる実際の描画結果は <game.jsonのディレクトリ>/actual 以下に保存される。
	 * 正解データとテスト結果の描画差異は <game.jsonのディレクトリ>/diff 以下に保存される。
	 */
	it("content-v3 のレンダリング結果が正解データと正しいことを確認", async () => {
		// TODO: ポイントダウンイベントなどを利用しているようなもう少し本格的なコンテンツで動作を確認するように変更
		const contentPath = path.resolve(__dirname, "fixtures", "content-v3");
		const playManager = new PlayManager();
		const playId = await playManager.createPlay({
			gameJsonPath: path.join(contentPath, "game.json")
		});
		const activeAMFlow = playManager.createAMFlow(playId);
		const playToken = playManager.createPlayToken(playId, activePermission);
		const runnerManager = new MockRunnerManager(playManager);
		const runnerId = await runnerManager.createRunner({
			playId,
			amflow: activeAMFlow,
			playToken,
			executionMode: "active",
			allowedUrls: null,
			trusted: true,
			renderingMode: "node-canvas"
		});
		const runner = runnerManager.getRunner(runnerId) as RunnerV3;

		// TODO: 以下ロジックの切り出し
		const expectedPath = path.join(contentPath, "expected");
		const actualPath = path.join(contentPath, "actual");
		const diffPath = path.join(contentPath, "diff");
		const threshold = 0.1;
		const filenameTransformer = (index: number): string => {
			return `frame_${("000" + index).slice(-3)}.png`;
		};

		const game = (await runner.start()) as RunnerV3Game;
		runner.pause();
		await runner.advanceUntil(() => game.scene()!.name === "content-v3-entry-scene");

		const width = game.width;
		const height = game.height;
		const canvas = runner.getPrimarySurfaceCanvas();
		const runnerContext = canvas.getContext("2d");

		// unlink exists files
		[
			...fs.readdirSync(actualPath).map((filename) => path.join(actualPath, filename)),
			...fs.readdirSync(diffPath).map((filename) => path.join(diffPath, filename))
		]
			.filter((filepath) => fs.statSync(filepath).isFile() && path.extname(filepath) === ".png")
			.forEach(fs.unlinkSync);

		// compare and write the result
		fs.readdirSync(expectedPath).forEach((filename, i) => {
			const expected = PNG.sync.read(fs.readFileSync(path.join(expectedPath, filename)));
			const actual = runnerContext.getImageData(0, 0, width, height);
			const diff = new PNG({ width, height });

			const missingPixels = pixelmatch(expected.data, actual.data, diff.data, width, height, {
				threshold
			});
			expect(missingPixels).toBe(0);

			const diffPNG = PNG.sync.write(diff);
			fs.writeFileSync(path.join(diffPath, filenameTransformer(i)), diffPNG);
			fs.writeFileSync(path.join(actualPath, filenameTransformer(i)), canvas.toBuffer());

			runner.step();
		});

		runner.stop();
	});
});
