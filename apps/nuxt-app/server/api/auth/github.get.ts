import type { H3Event } from 'h3'

import { defineEventHandler, getQuery } from 'h3'
import { useRuntimeConfig } from '#imports'

interface OAuthResponse {
  url: string
}

export default defineEventHandler(async (event: H3Event): Promise<OAuthResponse> => {
  const config = useRuntimeConfig()
  const hankoUrl = config.public.hankoApiUrl as string
  const baseUrl = (config.public.siteUrl as string) || 'http://localhost:3000'

  // Create the redirect URL to Hanko's GitHub OAuth endpoint
  const redirectUrl = new URL('/oauth/callback/github', hankoUrl)

  // Set the callback URL where Hanko will redirect after OAuth
  const callbackUrl = new URL('/auth/callback', baseUrl)

  // Add required parameters
  redirectUrl.searchParams.append('redirect_uri', callbackUrl.toString())

  // Add return_to parameter to redirect after successful login
  const query = getQuery(event)
  const returnTo = (query.return_to as string) || '/dashboard'
  redirectUrl.searchParams.append('return_to', returnTo)

  // Return the URL to redirect to
  return { url: redirectUrl.toString() }
})
