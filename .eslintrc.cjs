/* ESLint config for TouchGrass — Track A (core + data) scope.
 * Enforces the token-only rule (no arbitrary hex/px) is owned by Track C for
 * .tsx components; here we keep a lean TS rule set for the pure core and data
 * layers. */
module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  ignorePatterns: ["node_modules", "dist", "*.config.ts", "*.config.js"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
  },
};
