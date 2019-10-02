const game = g.game;

function main(param) {
	const scene = new g.Scene({game});
	scene.loaded.add(function () {
		const rect = new g.FilledRect({
			scene: scene,
			cssColor: "#ff0000",
			width: 32,
			height: 32
		});
		scene.append(rect);
	});
	// vm2 の NodeVM 上で実行した場合は process が undefined となりエラーとなる。
	process.exit();
}

module.exports = main;
