const path = require("path");
const fs = require("fs");
const execSync = require("child_process").execSync;

function updateChangelog(fromVersion) {
	const lernaChangeLogPath = path.join(__dirname, "..", "..", "node_modules", ".bin", "lerna-changelog");
	const addedLog = execSync(`${lernaChangeLogPath} --from v${fromVersion}`).toString();
	const currentChangeLog = fs.readFileSync(path.join(__dirname, "..", "..", "CHANGELOG.md")).toString();
	const nextChangeLog = currentChangeLog.replace("# CHANGELOG\n\n", "# CHANGELOG\n" + addedLog + "\n");
	fs.writeFileSync(path.join(__dirname, "..", "..", "CHANGELOG.md"), nextChangeLog);
}

exports.updateChangelog= updateChangelog;
