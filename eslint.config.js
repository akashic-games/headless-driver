const eslintConfig = require("@akashic/eslint-config");
const prettier = require("eslint-config-prettier");

module.exports = [
    ...eslintConfig,
    prettier,
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            sourceType: "module",
            parserOptions: {
                project: "tsconfig.eslint.json",
            },
        },
        ignores: ["**/*.js"]
    }
];
