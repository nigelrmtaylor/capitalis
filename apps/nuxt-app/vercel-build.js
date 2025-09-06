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
  execSync('pnpm run build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NITRO_PRESET: 'vercel',
      HUSKY: '0',
      CI: 'true'
    }
  });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
