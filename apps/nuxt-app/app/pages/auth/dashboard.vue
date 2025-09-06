<template>
  <div class="min-h-screen bg-gray-100">
    <div class="bg-indigo-600 pb-32">
      <header class="py-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold text-white">
            Dashboard
          </h1>
        </div>
      </header>
    </div>

    <main class="-mt-32">
      <div
        class="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8"
      >
        <div
          class="bg-white rounded-lg shadow px-5 py-6 sm:px-6"
        >
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-medium text-gray-900">
              Welcome to your dashboard
            </h2>
            <button
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              @click="handleLogout"
            >
              <NuxtIcon
                name="heroicons:arrow-left-on-rectangle"
                class="-ml-1 mr-2 h-5 w-5"
              />
              Sign out
            </button>
          </div>

          <div class="mt-6 border-t border-gray-200 pt-6">
            <h3 class="text-lg font-medium text-gray-900">
              Your Information
            </h3>
            <div class="mt-4">
              <p class="text-sm text-gray-500">
                <span class="font-medium text-gray-700">
                  Email:
                </span>
                {{ user?.email || 'Loading...' }}
              </p>
              <p class="mt-2 text-sm text-gray-500">
                <span class="font-medium text-gray-700">
                  User ID:
                </span>
                {{ user?.id || 'Loading...' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'

  interface User {
    email: string
    id: string
  }

  const router = useRouter()
  const user = ref<User | null>(null)
  const isLoading = ref(true)

  // Mock auth for now - will be replaced with actual implementation
  const logout = async () => {
    console.log('Logging out...')
    // TODO: Implement actual logout logic
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(true)
      }, 500)
    })
  }

  onMounted(async () => {
    try {
      // TODO: Fetch actual user data
      user.value = { email: 'user@example.com', id: '123' }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      isLoading.value = false
    }
  })

  const handleLogout = async () => {
    try {
      await logout()
      await router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
</script>
