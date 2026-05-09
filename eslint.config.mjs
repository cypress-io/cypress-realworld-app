import cypress from 'eslint-plugin-cypress'
import mocha from 'eslint-plugin-mocha'
import chaiFriendly from 'eslint-plugin-chai-friendly'
import sonarjs from 'eslint-plugin-sonarjs'
import tsParser from '@typescript-eslint/parser'

export default [
    {
        files: ['**/*.ts', '**/*.tsx'],
        plugins: {
            cypress,
            mocha,
            'chai-friendly': chaiFriendly,
            sonarjs,
        },
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 8,
                ecmaFeatures: {
                    jsx: true,
                    modules: true,
                },
                sourceType: 'module',
            },
        },
        rules: {
            'cypress/no-assigning-return-values': 'error',
            'cypress/no-unnecessary-waiting': 'warn',
            'cypress/assertion-before-screenshot': 'warn',
            'cypress/no-force': 'off',
            'cypress/no-async-tests': 'error',
            'cypress/no-pause': 'error',
            'cypress/unsafe-to-chain-command': 'off',
            'mocha/no-exclusive-tests': 'error',
            'sonarjs/todo-tag': 'off',
            'sonarjs/pseudo-random': 'off',
            'sonarjs/no-nested-functions': 'off',
            'sonarjs/no-nested-template-literals': 'off',
        },
    },
]
