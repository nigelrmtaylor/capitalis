// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import viteTsconfigPaths from 'vite-tsconfig-paths'

// Create the Vite config first
const viteConfig = {
  define: {
    // This helps with the import.meta issue
    'import.meta.env': 'import.meta.env',
  },
  optimizeDeps: {
    // Force Vite to pre-bundle vite-tsconfig-paths
    include: ['vite-tsconfig-paths']
  },
  plugins: [viteTsconfigPaths()]
}

export default defineNuxtConfig({
  devtools: { enabled: true },

  // Modules with their configurations
  modules: [
    '@nuxt/ui',
    ['@nuxtjs/color-mode', {
      preference: 'system',
      fallback: 'light',
      classSuffix: ''
    }],
    ['@nuxtjs/i18n', {
      strategy: 'prefix_except_default',
      defaultLocale: 'en',
      locales: [
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'Français' },
        { code: 'de', name: 'Deutsch' },
        { code: 'es', name: 'Español' }
      ]
    }],
    '@pinia/nuxt'
  ],

  // TypeScript Configuration
  typescript: {
    strict: true,
    typeCheck: false // Temporarily disable type checking during development
  },
  
  // CSS Configuration
  css: ['../app/assets/css/main.css'],
  
  // PostCSS Configuration
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {}, // ✅ v4 plugin
    },
  } as any, // Type assertion for now to bypass type checking
  
  // Runtime Configuration
  runtimeConfig: {
    public: {
      appName: 'Capitalis',
      appDescription: 'Comprehensive Asset Management Platform',
    }
  },

  // Vite Configuration
  vite: {
    ...viteConfig,
    define: {
      'process.env': {}
    },
    optimizeDeps: {
      exclude: ['fsevents'],
      include: []
    },
    ssr: {
      noExternal: ['lightningcss']
    }
  },

  // Build Configuration
  build: {
    transpile: ['@headlessui/vue']
  }
})
