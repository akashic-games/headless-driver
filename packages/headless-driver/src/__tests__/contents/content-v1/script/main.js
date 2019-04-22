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
		}
		game.external.send(message);
	});
	game.pushScene(scene);
}

module.exports = main;

// test for trailing newline