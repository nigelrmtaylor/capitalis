<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <!-- Navigation -->
    <header class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <span class="text-xl font-bold text-gray-900 dark:text-white">Capitalis</span>
          </div>
          <nav class="flex items-center space-x-8">
            <NuxtLink to="/" class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Home
            </NuxtLink>
            <NuxtLink to="/dashboard" class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Dashboard
            </NuxtLink>
            <NuxtLink to="/login" class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
              Sign In
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center">
        <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          <span class="block">Welcome to</span>
          <span class="block text-blue-600 dark:text-blue-400">Capitalis</span>
        </h1>
        <p class="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Your comprehensive asset management solution. Track, manage, and optimize your resources in one place.
        </p>
        <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div class="rounded-md shadow">
            <NuxtLink to="/register" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
              Get Started
            </NuxtLink>
          </div>
          <div class="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
            <NuxtLink to="/features" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
              Learn more
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="mt-16">
        <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white text-center">Powerful Features</h2>
        <div class="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div class="w-12 h-12 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Asset Tracking</h3>
            <p class="mt-2 text-gray-500 dark:text-gray-400">Keep track of all your assets in one centralized location with real-time updates.</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div class="w-12 h-12 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Performance Analytics</h3>
            <p class="mt-2 text-gray-500 dark:text-gray-400">Gain insights with powerful analytics and detailed performance reports.</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div class="w-12 h-12 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Secure & Private</h3>
            <p class="mt-2 text-gray-500 dark:text-gray-400">Your data is protected with enterprise-grade security measures.</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white dark:bg-gray-800 mt-12 border-t border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <p class="text-center text-base text-gray-500 dark:text-gray-400">
          &copy; 2025 Capitalis. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
// You can add any component logic here
</script>
