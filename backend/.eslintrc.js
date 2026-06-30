{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "tsconfig.json",
    "tsconfigRootDir": ".",
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint/eslint-plugin"],
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "env": {
    "node": true,
    "jest": true
  },
  "ignorePatterns": [".eslintrc.js", "dist", "node_modules", "prisma/seed.ts"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "prettier/prettier": ["error", {}, { "usePrettierrc": true }]
  }
}
