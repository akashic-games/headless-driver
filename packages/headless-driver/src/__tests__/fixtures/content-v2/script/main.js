const game = g.game;

function main(param) {
	const scene = new g.Scene({
		game
	});

	scene.loaded.add(function() {
		// 以下にゲームのロジックを記述します。
		const rect = new g.FilledRect({
			scene: scene,
			cssColor: "#ff0000",
			width: 32,
			height: 32
		});
		rect.update.add(function () {
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

	scene.message.add(function(message) {
		if (message.data === "throw_error") {
			throw new Error("unknown error");
		} else if (message.data === "send_event") {
			game.raiseEvent(new g.MessageEvent({
				text: "data_from_content"
			}));
			return;
		} else if (message.data === "process") {
			// vm2 の NodeVM 上で実行した場合は process が undefined となりエラーとなる。
			process.exit();
		} else if (message.data === "require") {
			// 本来ならg._requireでnodeコアモジュールはエラーとなるが、何らかの方法でrequireが使用できるようにされた場合にVMでエラーとして弾く。
			const fs = global._require("fs");
			var dir = fs.readdirSync("/");
			console.log(dir);
		}
		game.external.send(message);
	});
	game.pushScene(scene);
}

module.exports = main;

// line comment test in trailing