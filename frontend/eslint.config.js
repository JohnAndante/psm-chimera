import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import unicorn from 'eslint-plugin-unicorn'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    plugins: {
      unicorn,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Forçar kebab-case em nomes de arquivos
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: [
            'App.tsx',
            'main.tsx',
            'vite-env.d.ts'
          ]
        }
      ],

      // Prevenir componentes personalizados em ui/
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/components/ui/routine-status-badge', '@/components/ui/textarea-with-counter'],
              message: 'Componentes personalizados devem ser importados de @/components/custom/'
            }
          ]
        }
      ]
    },
  },
])
