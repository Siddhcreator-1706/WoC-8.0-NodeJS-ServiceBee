const globals = require('globals');
const js = require('@eslint/js');

module.exports = [
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
            'no-unused-vars': ['warn', {
                varsIgnorePattern: '^_|^error$|^err$',
                argsIgnorePattern: '^_|^error$|^err$|^next$|^req$|^res$',
                caughtErrors: 'none'
            }],
            'no-empty': ['warn', { allowEmptyCatch: true }],
            'no-console': 'off',
            'semi': ['warn', 'always'],
            'quotes': ['warn', 'single', { avoidEscape: true }]
        }
    },
    {
        ignores: ['node_modules/**', 'coverage/**', '.vercel/**']
    }
];
