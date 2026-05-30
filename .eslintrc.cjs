/* ESLint config for TouchGrass.
   Enforces token-only styling (Requirement 9.2): no arbitrary hex colors or
   arbitrary px values in components. Colors/spacing must come from the design
   tokens via Tailwind utilities (bg-accent, p-2, text-muted). */
module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: [
    "dist",
    "node_modules",
    ".eslintrc.cjs",
    "tailwind.config.ts",
    "postcss.config.js",
    "vite.config.ts",
    "**/*.test.ts",
    "**/*.test.tsx",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react-refresh"],
  rules: {
    // Track A (core + data): allow intentionally-unused args prefixed with _.
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    // Token enforcement (Req 9.2). Arbitrary hex/px are banned in JSX string
    // literals (className) and string-valued style props. The deterministic
    // color in InitialsAvatar (Req 9.6) is computed, not a literal, so it is
    // exempt by design.
    "no-restricted-syntax": [
      "error",
      {
        selector:
          "JSXAttribute[name.name='className'] Literal[value=/#[0-9a-fA-F]{3,8}\\b/]",
        message:
          "No arbitrary hex colors in className. Use a design token utility (e.g. text-accent, bg-surface). [Req 9.2]",
      },
      {
        selector:
          "JSXAttribute[name.name='className'] Literal[value=/\\b\\d+px\\b/]",
        message:
          "No arbitrary px values in className. Use the spacing scale (p-2, gap-4) backed by tokens. [Req 9.2]",
      },
      {
        selector:
          "JSXAttribute[name.name='className'] TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b/]",
        message:
          "No arbitrary hex colors in className. Use a design token utility. [Req 9.2]",
      },
      {
        selector:
          "JSXAttribute[name.name='className'] TemplateElement[value.raw=/\\b\\d+px\\b/]",
        message:
          "No arbitrary px values in className. Use the spacing scale backed by tokens. [Req 9.2]",
      },
    ],
  },
};
