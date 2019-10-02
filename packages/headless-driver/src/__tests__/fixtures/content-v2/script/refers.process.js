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
	// sandbox内の場合、not functionでエラーとなる
	process.exit();
}

module.exports = main;
