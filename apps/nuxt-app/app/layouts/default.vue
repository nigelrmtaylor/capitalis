<script setup lang="ts">
// These are auto-imported by Nuxt 3
const isMobileMenuOpen = ref(false);

// Close mobile menu when route changes
const route = useRoute();
watch(() => route.path, () => {
  isMobileMenuOpen.value = false;
});
</script>


<template>
  <div class="min-h-screen flex flex-col font-sans">
    <!-- Top Navigation Bar -->
    <header class="shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <NuxtLink to="/" class="text-xl font-heading font-bold text-default">
                Capitalis
              </NuxtLink>
            </div>

            <nav class="hidden sm:ml-6 sm:flex sm:space-x-8 font-sans">
              <NuxtLink to="/"
                class="border-primary-500 text-muted hover:text-highlighted hover:border-secondary-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                active-class="border-primary-500 text-highlighted" exact>
                Home
              </NuxtLink>
              <NuxtLink to="/dashboard"
                class="border-transparent text-muted hover:text-highlighted hover:border-secondary-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                active-class="border-primary-500 text-highlighted">
                Dashboard
              </NuxtLink>
              <NuxtLink to="/assets"
                class="border-transparent text-muted hover:text-highlighted hover:border-secondary-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                active-class="border-primary-500 text-highlighted">
                Assets
              </NuxtLink>
              <NuxtLink to="/reports"
                class="border-transparent text-muted hover:text-highlighted hover:border-secondary-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                active-class="border-primary-500 text-highlighted">
                Reports
              </NuxtLink>
            </nav>
          </div>

          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <UColorModeButton />
            <NuxtLink to="/login"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              Sign in
            </NuxtLink>
          </div>
          <!-- Mobile menu button -->
          <div class="-mr-2 flex items-center sm:hidden">
            <button type="button"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              @click="isMobileMenuOpen = !isMobileMenuOpen">
              <span class="sr-only">Open main menu</span>
              <svg class="h-6 w-6" :class="{ 'hidden': isMobileMenuOpen, 'block': !isMobileMenuOpen }"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg class="h-6 w-6" :class="{ 'block': isMobileMenuOpen, 'hidden': !isMobileMenuOpen }"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu, show/hide based on menu state -->
      <div class="sm:hidden" v-show="isMobileMenuOpen">
        <div class="pt-2 pb-3 space-y-1">
          <NuxtLink to="/"
            class="bg-primary-50 border-primary-500 text-primary-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            active-class="bg-primary-50 border-primary-500 text-primary-700" exact>
            Home
          </NuxtLink>
          <NuxtLink to="/dashboard"
            class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            active-class="bg-primary-50 border-primary-500 text-primary-700">
            Dashboard
          </NuxtLink>
          <NuxtLink to="/assets"
            class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            active-class="bg-primary-50 border-primary-500 text-primary-700">
            Assets
          </NuxtLink>
          <NuxtLink to="/reports"
            class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            active-class="bg-primary-50 border-primary-500 text-primary-700">
            Reports
          </NuxtLink>
          <div class="pt-4 pb-3 border-t border-gray-200">
            <div class="mt-3 space-y-1">
              <NuxtLink to="/login"
                class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                Sign in
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Page Content -->
    <main class="flex-grow flex flex-col">
      <div class="flex-1">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="">
      <div class="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
        <p class="mt-4 text-center text-base text-gray-500">
          &copy; {{ new Date().getFullYear() }} Capitalis. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>
