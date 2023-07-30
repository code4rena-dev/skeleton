/* eslint-env node */
// This file is managed by code-skeleton. Do not make changes.
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict",
  ],
  rules: {
    semi: "off", // have to disable eslint's core semicolon rules before enabling typescript-eslint's
    "@typescript-eslint/semi": "error",
    "@typescript-eslint/member-delimiter-style": "error",
    quotes: ["error", "double", { "avoidEscape": true }],
  },
  ignorePatterns: ["coverage", "prisma/client/**/*"],
  overrides: [{
    files: ["test/**/*"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  }],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json"],
  },
  plugins: [
    "@typescript-eslint",
  ],
  root: true,
};
