import js from '@eslint/js';
import vuePlugin from 'eslint-plugin-vue';
import { createConfigForNuxt } from '@nuxt/eslint-config/flat';

export default createConfigForNuxt({
  // Global ignores
  ignores: ['**/node_modules/**', '**/dist/**', '**/.nuxt/**', '**/.output/**']
})
.append(
  // Base JavaScript rules
  js.configs.recommended,
  
  // Vue plugin with TypeScript support
  ...vuePlugin.configs['flat/recommended'],
  
  // Custom rules
  {
    files: ['**/*.js', '**/*.ts', '**/*.vue'],
    rules: {
      // Add your custom rules here
      'vue/multi-word-component-names': 'off',
      'vue/require-prop-types': 'off',
      'vue/require-default-prop': 'off',
      'vue/html-self-closing': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-indent': 'off'
    }
  }
);
