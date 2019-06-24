const path = require("path");
const execSync = require("child_process").execSync;
const updateChangelog = require("./parts/updateChangelog").updateChangelog;

const apiBaseUrl = "https://api.github.com/repos/akashic-games/headless-driver";
const pullRequestBody = "※自動作成されたPRです";
const pullRequestLabel = "republish";

if (process.argv.length < 3) {
	console.error("Please enter command as follows: node republishAndUpdateChangelog.js [patch|minor|major]");
	process.exit(1);
}

// どのバージョンを上げるのかを取得
const target = process.argv[2];
if (! /^patch|minor|major$/.test(target)) {
	console.error("Please specify patch, minor or major.");
	process.exit(1);
}

// lerna-changelogコマンドを実行するために環境変数GITHUB_AUTHにgithubへのアクセストークンを与える必要がある。
// しかし、与えられていなくてもコマンド実行時にエラーは発生しないのでここで事前にチェックする。
if (process.env.GITHUB_AUTH == null) {
	console.error("Must provide GITHUB_AUTH.");
	process.exit(1);
}

try {
	// PRのマージ元ブランチを作成しておく
	console.log("start to create branch");
	const branchName = "tmp_" + Date.now();
	// versionのbumpを行う前の準備作業
	execSync("git fetch");
	execSync("git checkout origin/master");
	execSync(`git checkout -b ${branchName}`);
	// PRを作るためだけに空コミットをしておく。PRはlerna-changelogでCHANGELOGを更新するために必要。
	execSync("git commit --allow-empty -m 'empty'");
	execSync(`git push origin ${branchName}`);
	console.log("end to create branch");

	// PRの作成とマージ処理
	console.log("start to create PR");
	// PRを作成する
	const pullReqDataString = execSync(`curl --fail -H "Authorization: token ${process.env.GITHUB_AUTH}" -X POST -d '{"title":"PR To Republish", "body":"${pullRequestBody}", "head":"akashic-games:${branchName}", "base":"master"}' ${apiBaseUrl}/pulls`).toString();
	const pullReqData = JSON.parse(pullReqDataString);
	// issue(PR)にラベル付ける
	execSync(`curl --fail -H "Authorization: token ${process.env.GITHUB_AUTH}" -X POST -d '{"labels": ["${pullRequestLabel}"]}' ${apiBaseUrl}/issues/${pullReqData["number"]}/labels`);
	// PRのマージ
	execSync(`curl --fail -H "Authorization: token ${process.env.GITHUB_AUTH}" -X PUT ${apiBaseUrl}/pulls/${pullReqData["number"]}/merge`);
	// ブランチ削除
	execSync("git checkout origin/master");
	execSync(`git branch -D ${branchName}`);
	execSync(`git push origin :${branchName}`);
	console.log("end to merge PR");

	// publish処理
	console.log("start to publish");
	execSync("git checkout master");
	execSync("git pull origin master");
	// CHANGELOG作成時に必要になるのでpublish前のバージョンを保持しておく
	const beforeVersion = require(path.join(__dirname, "..", "lerna.json")).version;
	execSync(`${path.join(__dirname, "..", "node_modules", ".bin", "lerna")} publish ${target} --force-publish=* --yes`);
	console.log("end to publish");

	// 現在のCHANGELOGに次バージョンのログを追加
	// 新しくタグを打ってからでないと前回のタグからの更新内容が取得できないため、CHANGELOGへの書き込みはpublish後に行う
	console.log("start to update changelog");
	updateChangelog(beforeVersion);
	execSync("git add ./CHANGELOG.md");
	execSync("git commit -m 'Update Changelog'");
	execSync("git push origin master");
	console.log("end to update changelog");
} catch (e) {
	console.error(e);
	process.exit(1);
}
