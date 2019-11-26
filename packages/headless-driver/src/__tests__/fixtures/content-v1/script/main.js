const game = g.game;

function main(param) {
	const scene = new g.Scene({
		game
	});

	scene.loaded.handle(function() {
		// 以下にゲームのロジックを記述します。
		const rect = new g.FilledRect({
			scene: scene,
			cssColor: "#ff0000",
			width: 32,
			height: 32
		});
		rect.update.handle(function () {
			// 以下のコードは毎フレーム実行されます。
			rect.x += 10;
			if (rect.x > game.width) {
				game.external.send("reached right");
				rect.x = 0;
			}
			rect.modified();
		});
		scene.append(rect);
	});

	scene.message.handle(function(message) {
		if (message.data === "throw_error") {
			throw new Error("unknown error");
		} else if (message.data === "send_event") {
			game.raiseEvent(new g.MessageEvent({
				text: "data_from_content"
			}));
			return;
		} else if (message.data === "process") {
			process.exit();
		} else if (message.data === "require") {
			const fs = global._require("fs");
			const dir = fs.readdirSync("/");
			console.log(dir);
		} else if (message.data === "arrowedTest") {
			scene.assetLoadFailed.handle((errInfo) => {
				game.external.send(errInfo);
			});
			scene.requestAssets([{
				id: "arrowedTest",
				uri: "https://github.com/akashic-games/headless-driver/blob/master/packages/headless-driver/src/index.ts",
				type: "text"
			}],
			() => {
				// load完了した対象のpathだけ返す
				game.external.send({ path: scene.assets.arrowedTest.path });
			});
		}
		game.external.send(message);
	});
	game.pushScene(scene);
}

module.exports = main;

// line comment test in trailing