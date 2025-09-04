<template>
  <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Or
          {{ ' ' }}
          <NuxtLink to="/register" class="font-medium text-primary-600 hover:text-primary-500">
            create a new account
          </NuxtLink>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div v-if="error" class="mb-4 rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <Icon name="heroicons:exclamation-circle" class="h-5 w-5 text-red-400" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  {{ error.message || 'An error occurred during login' }}
                </h3>
              </div>
            </div>
          </div>

          <div class="mb-6 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
            <p>Using Hanko URL: <code class="font-mono bg-blue-100 px-2 py-1 rounded">https://c4a5a608-41fc-4c69-abdd-75e5f63315e9.hanko.io</code></p>
          </div>

          <form class="space-y-6" @submit.prevent="handleLogin">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
              <div class="mt-1">
                <input
                  id="email"
                  v-model="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  :disabled="isLoading"
                  class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                :disabled="isLoading"
                class="flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                  <Icon name="heroicons:envelope" class="h-5 w-5 text-primary-400 group-hover:text-primary-300" />
                </span>
                {{ isLoading ? 'Sending magic link...' : 'Send magic link' }}
              </button>
            </div>
          </form>

          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div class="mt-6 grid grid-cols-2 gap-3">
              <button
                v-for="provider in oauthProviders"
                :key="provider.id"
                @click="loginWithOAuth(provider.id)"
                class="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
              >
                <span class="sr-only">Sign in with {{ provider.name }}</span>
                <Icon :name="provider.icon" class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
// Use the default layout
definePageMeta({
  layout: 'default'
});

import { ref } from 'vue'

const email = ref('')
const isLoading = ref(false)
const error = ref<{ message: string } | null>(null)

const oauthProviders = [
  { id: 'google', name: 'Google', icon: 'logos:google-icon' },
  { id: 'github', name: 'GitHub', icon: 'logos:github-icon' },
  { id: 'microsoft', name: 'Microsoft', icon: 'logos:microsoft-icon' },
  { id: 'apple', name: 'Apple', icon: 'logos:apple' }
]

interface OAuthResponse {
  url: string
}

const loginWithOAuth = async (provider: string) => {
  try {
    // Use the server API route we created
    const data = await $fetch<OAuthResponse>(`/api/auth/${provider}`)
    window.location.href = data.url
  } catch (err) {
    console.error('Failed to start OAuth flow:', err)
    error.value = {
      message: 'Failed to start authentication. Please try again.'
    }
  }
}

interface LoginResponse {
  success: boolean
  message?: string
}

const handleLogin = async () => {
  if (!email.value) return
  
  isLoading.value = true
  error.value = null
  
  try {
    const response = await $fetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: { email: email.value }
    })
    
    if (response.success) {
      alert('Check your email for the magic link to sign in!')
      email.value = ''
    }
  } catch (err: any) {
    error.value = {
      message: err.data?.message || 'Failed to send magic link. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>
