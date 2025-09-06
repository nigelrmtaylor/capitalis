import type { H3Event } from 'h3'

import { defineEventHandler, getQuery, createError } from 'h3'

import { useRuntimeConfig } from '#imports'

interface OAuthResponse {
  url: string
}

export default defineEventHandler(async (event: H3Event): Promise<OAuthResponse> => {
  const config = useRuntimeConfig()
  const hankoUrl = config.public.hankoApiUrl as string
  const baseUrl = (config.public.siteUrl as string) || 'http://localhost:3000'

  if (!hankoUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Hanko API URL is not configured'
    })
  }

  try {
    // Create the redirect URL to Hanko's GitHub OAuth endpoint
    const redirectUrl = new URL('/oauth/callback/github', hankoUrl)

    // Set the callback URL where Hanko will redirect after OAuth
    const callbackUrl = new URL('/auth/callback', baseUrl)

    // Add required parameters
    redirectUrl.searchParams.append('redirect_uri', callbackUrl.toString())

    // Add return_to parameter to redirect after successful login
    const query = getQuery(event)
    const returnTo = Array.isArray(query.return_to)
      ? query.return_to[0] || '/dashboard'
      : query.return_to || '/dashboard'

    redirectUrl.searchParams.append('return_to', returnTo)

    // Return the URL to redirect to
    return { url: redirectUrl.toString() }
  } catch (error) {
    console.error('Error in GitHub OAuth handler:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process OAuth request'
    })
  }
})
