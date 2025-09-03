module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    '@nuxt/eslint-config',
    'plugin:prettier/recommended',
  ],
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    // Add your custom rules here
    'vue/multi-word-component-names': 'off', // Disable multi-word component names
    'vue/require-default-prop': 'off', // Disable required default props
    'vue/attribute-hyphenation': ['error', 'always'], // Enforce hyphenation in template
    'vue/v-on-event-hyphenation': ['error', 'always'], // Enforce hyphenation in events
    'prettier/prettier': 'error', // Enable prettier rules
  },
  settings: {
    'import/resolver': {
      typescript: {},
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
      },
    },
  },
  ignorePatterns: ['.nuxt', 'dist', 'node_modules'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
      },
    },
  ],
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
