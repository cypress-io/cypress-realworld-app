import globals from 'globals'
import { defineConfig } from 'eslint/config'
import pluginJs from '@eslint/js'
import pluginTs from 'typescript-eslint'
import pluginTsParser from '@typescript-eslint/parser'
import pluginCypress from 'eslint-plugin-cypress'

export default defineConfig([
  {
    ignores: ['build/'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: pluginTsParser,
    },
  },
  pluginJs.configs.recommended,
  pluginTs.configs.recommended,
  pluginCypress.configs.recommended,
  {
    rules: {
      // TO-DO review violations of disabled rules
      'no-empty': 'off',
      'no-prototype-builtins': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'prefer-const': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
    }
  }
])
