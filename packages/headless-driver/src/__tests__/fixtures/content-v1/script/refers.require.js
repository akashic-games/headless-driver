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
	// 本来ならg._requireでnodeコアモジュールはエラーとなるが、何らかの方法でrequireが使用できるようにされた場合にVMでエラーとして弾く。
	const fs = global._require("fs");
	const dir = fs.readdirSync("/");
	console.log(dir)
}

module.exports = main;
