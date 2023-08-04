const game = g.game;

function main(param) {
	const scene = new g.Scene({
		game,
		name: "content-v3-entry-scene",
		assetPaths: ["/assets/**/*"]
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
		if (game.external.isSendingSceneUpdateCalled) {
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

	scene.onPointDownCapture.add(function() {
		game.external.send("fired point down event");
	});
	scene.onPointMoveCapture.add(function() {
		game.external.send("fired point move event");
	});
	scene.onPointUpCapture.add(function() {
		game.external.send("fired point up event");
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
			const process = (0, eval)("process");
			process.exit();
		} else if (message.data.type === "load_external_asset") {
			scene.assetLoadFailed.addOnce(() => {
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
		} else if (message.data.type === "load_script_asset_exports") {
			const { localVariable } = require("../assets/exports");
			game.external.send(localVariable);
			return;
		} else if (message.data.type === "load_binary_asset_data") {
			// TODO: 他の種別のアセットのテストも追加すべきかもしれない
			const asset = scene.asset.getBinary("/assets/akashic.bin");
			const assetArrayBuffer = asset.data;
			const str = String.fromCharCode.apply("", new Uint8Array(assetArrayBuffer)); // akashic!!
			game.external.send(str);
			return;
		}
		game.external.send(message);
	});
	game.pushScene(scene);
}

module.exports = main;

// line comment test in trailing