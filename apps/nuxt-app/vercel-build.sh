#!/bin/bash

# This script is used for building the Nuxt application on Vercel
# It bypasses TypeScript checking completely

echo "🚀 Starting Vercel build process..."

# Set environment variables
export NITRO_PRESET=vercel
export NODE_ENV=production
export HUSKY=0
export CI=true
export NUXT_TYPESCRIPT_CHECK=false

# Create a temporary nuxt.config.js that disables TypeScript checking
echo "📝 Creating temporary Nuxt config without TypeScript checking..."
cat > temp-nuxt.config.js << 'EOL'
export default {
  typescript: {
    typeCheck: false,
    shim: false
  },
  nitro: {
    preset: 'vercel'
  }
}
EOL

# Run the Nuxt build with the temporary config
echo "📦 Building Nuxt application..."
npx nuxt build --config temp-nuxt.config.js

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "✅ Build completed successfully!"
  exit 0
else
  echo "❌ Build failed!"
  exit 1
fi
