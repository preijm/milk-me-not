import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".claude"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // These two are what eslint-plugin-react-hooks 5 shipped as its
      // recommended set, spelled out rather than spread.
      //
      // Version 7 was needed because 5 declares a peer of eslint ^3-^9 against
      // the pinned ^10, which npm refuses to resolve. But 7's recommended set
      // also folds in the React Compiler rules, and those flag 27 issues in
      // this codebase — 24 of them setState called inside an effect. Worth
      // fixing, and tracked separately; adopting them here would have turned a
      // dependency bump into a rewrite of effect logic across twenty files.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  }
);
