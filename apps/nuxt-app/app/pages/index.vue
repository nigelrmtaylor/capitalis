<script setup>
// Use the default layout
definePageMeta({
  layout: 'default'
});
</script>

<template>
  <div class="flex-1 bg-background text-default">

    <!-- Hero Section -->
    <div class="flex flex-col items-center justify-center py-16">
      <div class="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="tracking-tight text-4xl font-heading font-bold sm:text-5xl md:text-6xl">
            <span class="block text-default">Welcome to</span>
            <span class="block text-secondary">Capitalis</span>
          </h1>
          <p class="mt-3 max-w-md mx-auto text-muted sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Your comprehensive asset management solution. Track, manage, and optimize your resources in one place.
          </p>
          <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div class="rounded-md shadow">
              <NuxtLink to="/register"
                class="w-full flex items-center justify-center px-8 py-3 border border-transparent  font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10">
                Get Started
              </NuxtLink>
            </div>

            <div class="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <NuxtLink to="/features"
                class="w-full flex items-center justify-center px-8 py-3 border border-transparent   font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                Learn more
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Features Section -->
        <div class="mt-16">
          <h2 class="text-3xl font-heading font-bold text-center">Powerful Features</h2>
          <div class="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div class="bg-card text-card-foreground p-6 rounded-lg shadow">
              <div class="w-12 h-12 rounded-md bg-primary-100 flex items-center justify-center">
                <svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 class="mt-4 text-lg font-medium">Asset Tracking</h3>
              <p class="mt-2 text-muted">Keep track of all your assets in one centralized location
                with real-time updates.</p>
            </div>

            <div class="bg-card text-card-foreground p-6 rounded-lg shadow">
              <div class="w-12 h-12 rounded-md bg-primary-100 flex items-center justify-center">
                <svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="mt-4 text-lg font-medium">Performance Analytics</h3>
              <p class="mt-2 text-muted">Gain insights with powerful analytics and detailed
                performance reports.</p>
            </div>

            <div class="bg-card text-card-foreground p-6 rounded-lg shadow">
              <div class="w-12 h-12 rounded-md bg-primary-100 flex items-center justify-center">
                <svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 class="mt-4 text-lg font-medium">Secure & Private</h3>
              <p class="mt-2 text-muted">Your data is protected with enterprise-grade security
                measures.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
