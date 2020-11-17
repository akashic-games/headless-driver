const game = g.game;

function main(param) {
	const scene = new g.Scene({
		game
	});

	scene.update.handle(function() {
		if (game.external.isSendingSceneUpdateCalled) {
			game.external.send("scene_update");
		}
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

	scene.pointDownCapture.handle(function(ev) {
		game.external.send("fired point down event");
	});
	scene.pointMoveCapture.handle(function() {
		game.external.send("fired point move event");
	});
	scene.pointUpCapture.handle(function() {
		game.external.send("fired point up event");
	});

	scene.message.handle(function(message) {
		if (message.data.type === "throw_error") {
			throw new Error("unknown error");
		} else if (message.data.type === "send_event") {
			game.raiseEvent(new g.MessageEvent({
				text: "data_from_content"
			}));
			return;
		} else if (message.data.type === "process") {
			process.exit();
		} else if (message.data.type === "require") {
			const fs = global._require("fs");
			const dir = fs.readdirSync("/");
			console.log(dir);
		} else if (message.data.type === "load_external_asset") {
			scene.assetLoadFailed.handle((errInfo) => {
				game.external.send("failed_load_external_asset");
				return true;
			});
			// 別の場所にあるリソースを動的に読み込む
			scene.requestAssets([{
				id: "external",
				uri: message.data.url,
				type: "text"
			}],
			() => {
				if (scene.assets.external != null) {
					game.external.send("loaded_external_asset");
				}
			});
			return;
		}
		game.external.send(message);
	});
	game.pushScene(scene);
}

module.exports = main;

// line comment test in trailing