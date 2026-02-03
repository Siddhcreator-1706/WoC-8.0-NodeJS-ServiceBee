import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Allow unused vars if they start with _ or are named error/err
      'no-unused-vars': ['warn', {
        varsIgnorePattern: '^_|^error$|^err$',
        argsIgnorePattern: '^_|^error$|^err$',
        caughtErrors: 'none'
      }],
      // Warn instead of error for exhaustive deps
      'react-hooks/exhaustive-deps': 'warn',
      // Allow exporting hooks alongside components
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
])
