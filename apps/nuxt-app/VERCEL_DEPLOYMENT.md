# Deploying Capitalis Nuxt App to Vercel

This guide explains how to deploy the Capitalis Nuxt 4 application to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- Git repository connected to Vercel (GitHub, GitLab, or Bitbucket)
- Hanko API credentials

## Deployment Steps

### 1. Push Your Code to GitHub

Ensure your code is pushed to your GitHub repository.

### 2. Import Your Project in Vercel

1. Log in to your [Vercel dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Select your GitHub repository
4. Configure the project:
   - **Framework Preset**: Nuxt.js
   - **Root Directory**: `apps/nuxt-app`
   - **Build Command**: `pnpm run build:vercel`
   - **Output Directory**: `.output/public`
   - **Install Command**: `pnpm install`

### 3. Configure Environment Variables

Add the following environment variables in the Vercel project settings:

```HANKO_API_URL=https://your-hanko-instance.hanko.io

NUXT_PUBLIC_HANKO_API_URL=https://your-hanko-instance.hanko.io
HANKO_SECRET=your_hanko_secret
HANKO_WEBHOOK_SECRET=your_hanko_webhook_secret
NUXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
NODE_ENV=production
```

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## Continuous Deployment

Vercel will automatically deploy your application when you push changes to your repository. The deployment process follows these steps:

1. Vercel detects changes in your repository
2. Builds your application using the specified build command
3. Deploys the output to Vercel's global CDN

## Troubleshooting

### Build Failures

If your build fails, check the following:

1. Ensure all dependencies are correctly installed
2. Verify that environment variables are correctly set
3. Check the build logs for specific errors

### Runtime Errors

If your application deploys but doesn't work correctly:

1. Check browser console for JavaScript errors
2. Verify API endpoints are correctly configured
3. Ensure environment variables are properly accessed in your code

## Custom Domains

To use a custom domain:

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your domain and follow the verification steps

## Additional Resources

- [Nuxt 4 Deployment Documentation](https://nuxt.com/docs/getting-started/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Hanko Authentication Documentation](https://docs.hanko.io/)
