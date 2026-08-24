import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
  { ignores: ["dist", "node_modules"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // pas nécessaire avec React 17+ / Vite
      "react/prop-types": "off", // pas de PropTypes dans ce projet (pas de TypeScript non plus)
      "react-refresh/only-export-components": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Désactivé : cette règle signale les apostrophes/guillemets "non
      // échappés" dans le texte JSX (l', d', j'...) — ça s'affiche
      // parfaitement bien tel quel en React, ce n'est pas un vrai bug.
      // Très bruyant pour un site en français plein de texte courant.
      "react/no-unescaped-entities": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },
];
