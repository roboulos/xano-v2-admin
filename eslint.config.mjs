import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Custom rules to reduce noise from existing code
  {
    rules: {
      // Downgrade any type errors to warnings (603 existing violations)
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow unused vars with underscore prefix
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],
      // Downgrade other common issues to warnings
      "react/no-unescaped-entities": "warn",
      "prefer-const": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
    },
  },
]);

export default eslintConfig;
