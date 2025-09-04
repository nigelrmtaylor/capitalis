// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // CSS configuration
  css: ['./assets/css/main.css'],
  
  // Module configuration
  modules: [
    '@nuxt/ui',
    ['@nuxtjs/i18n', {
      strategy: 'no_prefix',
      defaultLocale: 'en',
      langDir: 'locales',
      lazy: true,
      locales: [
        { code: 'en', file: 'en.json' },
        { code: 'fr', file: 'fr.json' },
        { code: 'de', file: 'de.json' },
        { code: 'es', file: 'es.json' }
      ]
    }],
    '@pinia/nuxt'
  ],
  
  
  compatibilityDate: '2025-09-03',
  devtools: { enabled: true },
  
  // TypeScript Configuration
  typescript: {
    strict: true,
    typeCheck: true
  },
  
  // Runtime Configuration
  // UI and Theme Configuration
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    storageKey: 'nuxt-color-mode'
  },
  
  // UI Module Configuration
  ui: {
    global: true,
    icons: ['mdi', 'heroicons'],
    safelistColors: ['primary', 'secondary', 'success', 'info', 'warning', 'error']
  },

  runtimeConfig: {
    public: {
      appName: 'Capitalis',
      appDescription: 'Comprehensive Asset Management Platform',
      hankoApiUrl: process.env.NUXT_PUBLIC_HANKO_API_URL || 'https://c4a5a608-41fc-4c69-abdd-75e5f63315e9.hanko.io',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      nodeEnv: process.env.NODE_ENV || 'development',
    },
    hanko: {
      secret: process.env.HANKO_SECRET,
      webhookSecret: process.env.HANKO_WEBHOOK_SECRET,
    },
  },

  // Vite Configuration
  vite: {
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
