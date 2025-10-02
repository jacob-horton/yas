import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import solid from 'eslint-plugin-solid';
import prettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist', 'node_modules'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      solid,
      prettier,
    },
    rules: {
      ...solid.configs['recommended'].rules,
      ...eslintConfigPrettier.rules,
    },
  },
];
