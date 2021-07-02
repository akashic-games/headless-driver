module.exports = {
	root: true,
	extends: [
		"@akashic/eslint-config",
		"prettier"
	],
	parserOptions: {
		project: "./tsconfig.eslint.json",
		sourceType: "module",
		tsconfigRootDir: __dirname
	},
	ignorePatterns: [
		"**/*.js"
	]
};
