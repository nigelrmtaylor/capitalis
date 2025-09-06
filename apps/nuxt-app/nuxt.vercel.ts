import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/getting-started/deployment#vercel
export default defineNuxtConfig({
  // Disable server-side rendering for static deployment
  ssr: true,
  
  // Configure nitro for Vercel
  nitro: {
    preset: 'vercel',
    prerender: {
      crawlLinks: true,
      routes: ['/']
    }
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
  }
})
