// @ts-check

import eslint from "@eslint/js";
import tsEslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tsEslint.config(
  {
    ...eslint.configs.recommended,
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2015,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        requireConfigFile: false,
      },
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        console: "readonly",
        ResizeObserver: "readonly",
      },
    },
  },
  tsEslint.configs.strict,
  reactHooks.configs["recommended-latest"],
);
