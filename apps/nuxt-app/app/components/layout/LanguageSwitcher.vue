<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import { useSwitchLocalePath, navigateTo } from '#imports'

  // Import the locale type from vue-i18n
  import type { Locale } from 'vue-i18n'

  const { t, locale, locales, setLocale } = useI18n()
  const switchLocalePath = useSwitchLocalePath()

  // Switch language function with type safety
  const switchLanguage = async (locale: Locale) => {
    try {
      await setLocale(locale)
      const path = switchLocalePath(locale)
      if (path) {
        await navigateTo(path, {
          redirectCode: 302,
          replace: true,
        })
      }
    } catch (error) {
      console.error('Error switching language:', error)
    }
  }
</script>

<template>
  <UDropdownMenu
    :items="
      locales.map(loc => {
        const code = loc.code
        return {
          label: `${code.toUpperCase()} - ${loc.name || code.toUpperCase()}`,
          value: code,
          active: locale === code,
          onSelect() {
            switchLanguage(code)
          },
        }
      })
    "
    :ui="{
      content: 'w-16',
      item: [
        'text-sm px-3 py-1.5',
        'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
        'data-[active=true]:text-primary-600 dark:data-[active=true]:text-primary-400',
        'transition-colors duration-150',
        'flex items-center justify-between',
        'cursor-pointer',
      ],
    }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      trailing-icon="i-heroicons-chevron-down-20-solid"
      :label="locale.toUpperCase()"
      :title="t('language_switcher')"
    />
  </UDropdownMenu>
</template>
