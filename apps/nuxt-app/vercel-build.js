#!/usr/bin/env node

// Import the build process using ES modules
import { execSync } from 'child_process';

// This script is used by Vercel to build the application
// It ensures Husky doesn't run in CI environments

console.log('🚀 Starting Vercel build process...');

// Set environment variables for Vercel deployment
process.env.NITRO_PRESET = 'vercel';
process.env.CI = 'true';
process.env.HUSKY = '0';

try {
  console.log('📦 Building Nuxt application for Vercel...');
  // Use the production build script with custom Vercel config
  console.log('Using custom Nuxt config for Vercel deployment...');
  execSync('NODE_ENV=production pnpm run build:vercel-prod', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      HUSKY: '0',
      CI: 'true',
      NODE_ENV: 'production',
      NUXT_TYPESCRIPT_CHECK: 'false'
    }
  });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
