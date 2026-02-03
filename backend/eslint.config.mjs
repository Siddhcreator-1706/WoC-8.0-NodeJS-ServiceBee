import globals from 'globals';
import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.es2021
            }
        },
        rules: {
            // Allow unused vars if they start with _ or are named error/err/next/req/res
            'no-unused-vars': ['warn', {
                varsIgnorePattern: '^_|^error$|^err$',
                argsIgnorePattern: '^_|^error$|^err$|^next$|^req$|^res$',
                caughtErrors: 'none'
            }],
            'no-console': 'off',
            'semi': ['warn', 'always'],
            'quotes': ['warn', 'single', { avoidEscape: true }],
            'comma-dangle': ['warn', 'never'],
            'no-multiple-empty-lines': ['warn', { max: 2 }]
        }
    },
    {
        ignores: [
            'node_modules/**',
            'coverage/**',
            '.vercel/**'
        ]
    }
];
