import globals from "globals";

export default [
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-throw-literal": "error",
      "prefer-promise-reject-errors": "error",
      "no-return-await": "error",
      "require-await": "error",
    },
    ignores: [
      "node_modules/**",
      "coverage/**",
      "dist/**",
    ],
  },
];
