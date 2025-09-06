<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSwitchLocalePath, navigateTo } from '#imports'

// These are auto-imported by Nuxt 3
const isMobileMenuOpen = ref(false)
const { t, locale: currentLocale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
// Create a typed ref for the current locale
const locale = ref<string>(currentLocale.value as string)

// Define the locale type based on the actual i18n config
interface LocaleObject {
  code: string
  file: string
  name?: string
}

// Define supported locale codes
type LocaleCode = 'en' | 'fr' | 'de' | 'es' | 'zh' | 'pt'

// Get typed locales from i18n config
const typedLocales = computed(() => {
  return (locales.value as Array<LocaleObject>).map(loc => ({
    code: loc.code,
    name: loc.name || loc.code.toUpperCase(),
    file: loc.file || `${loc.code}.json`,
  }))
})

// Close mobile menu when route changes
const route = useRoute()
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false
  }
)

// Switch language function
const switchLanguage = async (code: string) => {
  const localeObj = typedLocales.value.find(loc => loc.code === code)
  if (localeObj) {
    locale.value = code
    // Use proper typing for the locale code
    const path = switchLocalePath(code as LocaleCode)
    if (path) {
      await navigateTo(path)
    }
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans">
    <!-- Top Navigation Bar -->
    <header class="shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <NuxtLink
                to="/"
                class="text-xl font-heading font-bold text-default"
              >
                Capitalis
              </NuxtLink>
            </div>

            <nav class="hidden sm:ml-6 sm:flex sm:space-x-8 font-heading">
              <NuxtLink
                to="/"
                class="border-primary-500 text-muted hover:text-highlighted hover:border-secondary-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-heading transition-colors duration-200"
                active-class="border-primary-500 text-highlighted"
                exact
              >
                {{ t('navigation.home') }}
              </NuxtLink>
              <NuxtLink
                to="/auth/dashboard"
                class="border-transparent text-muted hover:text-highlighted hover:border-secondary-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-heading transition-colors duration-200"
                active-class="border-primary-500 text-highlighted"
              >
                {{ t('navigation.dashboard') }}
              </NuxtLink>
              <NuxtLink
                to="/auth/assets"
                class="border-transparent text-muted hover:text-highlighted hover:border-secondary-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-heading transition-colors duration-200"
                active-class="border-primary-500 text-highlighted"
              >
                {{ t('navigation.assets') }}
              </NuxtLink>
              <NuxtLink
                to="/auth/reports"
                class="border-transparent text-muted hover:text-highlighted hover:border-secondary-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-heading transition-colors duration-200"
                active-class="border-primary-500 text-highlighted"
              >
                {{ t('navigation.reports') }}
              </NuxtLink>
            </nav>
          </div>

          <div class="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <!-- Language Switcher Component -->
            <LayoutLanguageSwitcher />

            <UColorModeButton />
            <NuxtLink
              to="/login"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {{ t('sign_in') }}
            </NuxtLink>
          </div>
          <!-- Mobile menu button -->
          <div class="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              @click="isMobileMenuOpen = !isMobileMenuOpen"
            >
              <span class="sr-only">Open main menu</span>
              <svg
                class="h-6 w-6"
                :class="{ hidden: isMobileMenuOpen, block: !isMobileMenuOpen }"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                class="h-6 w-6"
                :class="{ block: isMobileMenuOpen, hidden: !isMobileMenuOpen }"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu, show/hide based on menu state -->
      <div
        v-show="isMobileMenuOpen"
        class="sm:hidden"
      >
        <div class="pt-2 pb-3 space-y-1">
          <NuxtLink
            to="/"
            class="bg-primary-50 border-primary-500 text-primary-700 block pl-3 pr-4 py-2 border-l-4 text-base font-heading"
            active-class="bg-primary-50 border-primary-500 text-primary-700"
            exact
          >
            {{ t('navigation.home') }}
          </NuxtLink>
          <NuxtLink
            to="/auth/dashboard"
            class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-heading"
            active-class="bg-primary-50 border-primary-500 text-primary-700"
          >
            {{ t('navigation.dashboard') }}
          </NuxtLink>
          <NuxtLink
            to="/auth/assets"
            class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-heading"
            active-class="bg-primary-50 border-primary-500 text-primary-700"
          >
            {{ t('navigation.assets') }}
          </NuxtLink>
          <NuxtLink
            to="/auth/reports"
            class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-heading"
            active-class="bg-primary-50 border-primary-500 text-primary-700"
          >
            {{ t('navigation.reports') }}
          </NuxtLink>
          <div class="pt-4 pb-3 border-t border-gray-200">
            <div class="mt-3 space-y-1">
              <NuxtLink
                to="/login"
                class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                {{ t('sign_in') }}
              </NuxtLink>
              <div class="border-t border-gray-200 mt-2 pt-2">
                <div class="px-4 py-2 text-sm font-medium text-gray-700">
                  {{ t('language') }}
                </div>
                <button
                  v-for="loc in typedLocales"
                  :key="loc.code"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                  :class="{ 'font-semibold text-primary-600': locale === loc.code }"
                  @click="switchLanguage(loc.code)"
                >
                  <span
                    >{{ loc.code.toUpperCase() }} - {{ loc.name || loc.code.toUpperCase() }}</span
                  >
                  <span
                    v-if="locale === loc.code"
                    class="text-primary-500"
                  >
                    <UIcon
                      name="i-heroicons-check-16-solid"
                      class="w-4 h-4"
                    />
                  </span>
                </button>
              </div>
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
    <footer class="bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <!-- Copyright -->
          <p class="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
            &copy; {{ new Date().getFullYear() }} Capitalis. {{ t('footer.copyright') }}
          </p>

          <!-- Footer Links -->
          <div class="mt-4 md:mt-0 flex space-x-6">
            <NuxtLink
              to="/privacy"
              class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {{ t('footer.links.privacy') }}
            </NuxtLink>
            <NuxtLink
              to="/terms"
              class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {{ t('footer.links.terms') }}
            </NuxtLink>
            <NuxtLink
              to="/contact"
              class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {{ t('footer.links.contact') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
