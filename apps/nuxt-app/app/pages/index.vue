<script setup>
// Use the default layout
definePageMeta({
  layout: 'default'
});

const { t } = useI18n();
</script>

<template>
  <div class="flex-1 bg-background text-default">
    <!-- Hero Section -->
    <div class="flex flex-col items-center justify-center py-16">
      <div class="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="tracking-tight text-4xl font-heading font-bold sm:text-5xl md:text-6xl">
            <span class="block text-default">{{ $t('index.welcome') }}</span>
            <span class="block text-primary">Capitalis</span>
          </h1>
          <p class="mt-3 max-w-md mx-auto text-muted sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            {{ $t('index.tagline') }}
          </p>
          <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div class="rounded-md shadow">
              <NuxtLink to="/register"
                class="w-full flex items-center justify-center px-8 py-3 border border-transparent font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10">
                {{ $t('index.cta.get_started') }}
              </NuxtLink>
            </div>

            <div class="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <NuxtLink to="/features"
                class="w-full flex items-center justify-center px-8 py-3 border border-transparent font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                {{ $t('index.cta.learn_more') }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Features Section -->
        <div class="mt-16">
          <h2 class="text-3xl font-heading font-bold text-center">
            {{ $t('index.features.title') }}
          </h2>
          <div class="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <!-- Asset Tracking -->
            <div class="bg-card text-card-foreground p-6 rounded-lg shadow">
              <div class="w-12 h-12 rounded-md bg-primary-100 flex items-center justify-center">
                <svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 class="mt-4 text-lg font-medium">{{ $t('index.features.asset_tracking.title') }}</h3>
              <p class="mt-2 text-muted">
                {{ $t('index.features.asset_tracking.description') }}
              </p>
            </div>

            <!-- Performance Analytics -->
            <div class="bg-card text-card-foreground p-6 rounded-lg shadow">
              <div class="w-12 h-12 rounded-md bg-primary-100 flex items-center justify-center">
                <svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="mt-4 text-lg font-medium">{{ $t('index.features.analytics.title') }}</h3>
              <p class="mt-2 text-muted">
                {{ $t('index.features.analytics.description') }}
              </p>
            </div>

            <!-- Secure & Private -->
            <div class="bg-card text-card-foreground p-6 rounded-lg shadow">
              <div class="w-12 h-12 rounded-md bg-primary-100 flex items-center justify-center">
                <svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 class="mt-4 text-lg font-medium">{{ $t('index.features.security.title') }}</h3>
              <p class="mt-2 text-muted">
                {{ $t('index.features.security.description') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
