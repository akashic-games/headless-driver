const path = require("path");
const fs = require("fs");
const execSync = require("child_process").execSync;

if (process.argv.length < 3) {
	console.error("Please enter command as follows: node publishAndUpdateChangelog.js [patch|minor|major]");
	process.exit(1);
}

// どのバージョンを上げるのかを取得
const target = process.argv[2];
if (! /^patch|minor|major$/.test(target)) {
	console.error("Please specify patch, minor or major.");
	process.exit(1);
}

const lernaPath = path.join(__dirname, "..", "node_modules", ".bin", "lerna");
// 更新するモジュールが無ければChangelog更新処理を行わず終了する
if (parseInt(execSync(`${lernaPath} changed | wc -l`).toString(), 10) === 0) {
	console.error("No modules to update version.");
	process.exit(1);
}

// lerna-changelogコマンドを実行するために環境変数GITHUB_AUTHにgithubへのアクセストークンを与える必要がある。
// しかし、与えられていなくてもコマンド実行時にエラーは発生しないのでここで事前にチェックする。
if (process.env.GITHUB_AUTH == null) {
	console.error("Must provide GITHUB_AUTH.");
	process.exit(1);
}

// publish処理
console.log("start to publish");
// CHANGELOG作成時に必要になるのでpublish前のバージョンを保持しておく
const beforeVersion = require(path.join(__dirname, "..", "lerna.json")).version;
execSync(`${lernaPath} publish ${target} --yes`);
console.log("end to publish");

// 現在のCHANGELOGに次バージョンのログを追加
console.log("start to update changelog");
const lernaChangeLogPath = path.join(__dirname, "..", "node_modules", ".bin", "lerna-changelog");
const addedLog = execSync(`${lernaChangeLogPath} --from v${beforeVersion}`).toString();
const currentChangeLog = fs.readFileSync(path.join(__dirname, "..", "CHANGELOG.md")).toString();
const nextChangeLog = currentChangeLog.replace("# CHANGELOG\n\n", "# CHANGELOG\n" + addedLog + "\n");
fs.writeFileSync(path.join(__dirname, "..", "CHANGELOG.md"), nextChangeLog);
execSync("git add ./CHANGELOG.md");
execSync("git commit -m 'Update Changelog'");
execSync("git push origin master");
console.log("end to update changelog");
