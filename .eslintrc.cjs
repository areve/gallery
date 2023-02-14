/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: ["plugin:vue/vue3-essential", "eslint:recommended", "@vue/eslint-config-typescript", "@vue/eslint-config-prettier"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "no-sparse-arrays": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn", // or "error"
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "prefer-const": [
      "warn",
      {
        destructuring: "all",
        ignoreReadBeforeAssign: false,
      },
    ],
    "max-len": ["error", { code: 160, tabWidth: 2 }],
    "print-width": "off",
    "vue/multi-word-component-names": "warn",
  },
};
