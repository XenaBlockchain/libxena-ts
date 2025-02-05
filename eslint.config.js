import { Linter } from 'eslint'
import typescriptParser from '@typescript-eslint/parser'
import typescriptPlugin from '@typescript-eslint/eslint-plugin'
import tseslint from 'typescript-eslint'

/** @type {Linter.Config[]} */
export default [
  ...tseslint.configs.recommended,
  {
    ignores: ["node_modules/", "dist/", "coverage/", "eslint.config.js", "src/global.d.ts"],
  },
  {
    files: ['src/**/*', 'tests/**/*'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      'no-unused-vars': 'off',
      'no-console': 'warn',
      'prefer-const': 'off',
      "default-param-last": "off",
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      '@typescript-eslint/no-inferrable-types': 'warn',
      '@typescript-eslint/ban-ts-comment': [
        'warn',
        {
          'ts-expect-error': 'allow-with-description',
        },
      ],
      "@typescript-eslint/no-deprecated": "error",
      "@typescript-eslint/prefer-find": "error",
      "@typescript-eslint/consistent-indexed-object-style": "error",
      "@typescript-eslint/consistent-generic-constructors": "error",
      "@typescript-eslint/default-param-last": "error",
      "@typescript-eslint/consistent-type-imports": "error"
    },
    settings: {
      'import/resolver': {
        typescript: {},
      },
    }
  },
  {
    files: ['tests/**/*'], // Specific to test files
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-deprecated': 'off',
    },
  },
]