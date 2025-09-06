<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { definePageMeta } from '#imports'

  definePageMeta({
    auth: false, // This page doesn't require auth
  })

  const route = useRoute()
  const router = useRouter()

  onMounted(async () => {
    try {
      // The Hanko SDK will handle the OAuth callback automatically
      // After successful authentication, redirect to the dashboard or return URL
      const returnTo = route.query.return_to || '/'
      await router.push(returnTo as string)
    } catch (error) {
      console.error('Authentication failed:', error)
      await router.push('/login?error=oauth_failed')
    }
  })
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50"
  >
    <div class="text-center">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"
      />
      <p class="mt-4 text-gray-600">
        Completing authentication...
      </p>
    </div>
  </div>
</template>
