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
      // The full recommended set, React Compiler rules included. Turning these
      // on found 27 real issues, mostly state that was being computed in an
      // effect and set, so every keystroke rendered once against stale results.
      //
      // Six places genuinely cannot satisfy the rules and carry an inline
      // disable saying why: the camera and decoder lifecycles, the map's
      // reduced-motion shortcut, the auth bootstrap, Embla's subscription, and
      // the navigation-state filter on Results. Each of those is an imperative
      // side effect, not derivable state. Reach for a disable only when the
      // same is true — the other twenty-one turned out to be fixable.
      ...reactHooks.configs.recommended.rules,

      // Kept as a warning rather than the recommended error: the codebase has
      // deliberate omissions with reasons written next to them.
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
