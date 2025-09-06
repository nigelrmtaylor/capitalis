// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import process from 'node:process'
import type { ModuleOptions } from '@nuxtjs/hanko'

// Extend base configuration for Vercel deployment
export default defineNuxtConfig({
  // Disable TypeScript checking completely
  typescript: {
    typeCheck: false,
    strict: false,
    shim: false
  },

  // Configure nitro for Vercel
  nitro: {
    preset: 'vercel'
  },

  // Optimize for production
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    },
    cdnURL: process.env.NUXT_PUBLIC_CDN_URL || ''
  },

  // Vercel-specific optimizations
  routeRules: {
    // Cache static assets for 1 year
    '/assets/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    // Cache API responses for 10 seconds
    '/api/**': { headers: { 'cache-control': 'public, max-age=10, stale-while-revalidate=60' } },
  },

  // Hanko configuration
  hanko: {
    apiUrl: process.env.HANKO_API_URL || 'https://c4a5a608-41fc-4c69-abdd-75e5f63315e9.hanko.io'
  } as ModuleOptions
})
