const game = g.game;

function main(param) {
	const scene = new g.Scene({
		game
	});

	game.onSkipChange.add(function(skipped) {
		if (game.external.isSendSkipChanged) {
			if (skipped) {
				game.external.send("start_skipping");
			} else {
				game.external.send("end_skipping");
			}
		}
	});

	scene.onUpdate.add(function() {
		if (game.external.isSendSceneUpdateCalled) {
			game.external.send("scene_update");
		}
	});

	scene.onLoad.add(function() {
		// 以下にゲームのロジックを記述します。
		const rect = new g.FilledRect({
			scene: scene,
			cssColor: "#ff0000",
			width: 32,
			height: 32
		});
		rect.onUpdate.add(function () {
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

	scene.onMessage.add(function(message) {
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
			scene.assetLoadFailed.addOnce((errInfo) => {
				game.external.send("failed_load_external_asset");
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