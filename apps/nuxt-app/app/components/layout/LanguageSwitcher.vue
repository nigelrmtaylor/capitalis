<script setup lang="ts">
// Import types
type LocaleCode = 'en' | 'fr' | 'de' | 'es'
type Locale = {
    code: LocaleCode
    name: string
    file: string
}

const { locale, locales, setLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const router = useRouter()

// Cast the locales to our type
const typedLocales = computed<Locale[]>(() => (locales.value as Locale[]) || [])
const currentLocale = ref(locale.value as LocaleCode)

// Watch for locale changes
watch(locale, (newLocale) => {
    console.log('Locale changed to:', newLocale)
    currentLocale.value = newLocale as LocaleCode
})

// Switch language function with type safety
const switchLanguage = async (code: LocaleCode) => {
    console.log('Switching language to:', code)
    try {
        await setLocale(code)
        const path = switchLocalePath(code)
        if (path) {
            await navigateTo(path, { redirectCode: 302, replace: true })
        }
    } catch (error) {
        console.error('Error switching language:', error)
    }
}
</script>

<template>
    <UDropdownMenu :items="[typedLocales.map(loc => {
        const code = loc.code as LocaleCode
        return {
            label: `${code.toUpperCase()} - ${loc.name || code.toUpperCase()}`,
            value: code,
            active: locale === code,
            onSelect() {
                switchLanguage(code)
            }
        }
    })]" :ui="{
        content: 'w-16',
        item: [
            'text-sm px-3 py-1.5',
            'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
            'data-[active=true]:text-primary-600 dark:data-[active=true]:text-primary-400',
            'transition-colors duration-150',
            'flex items-center justify-between',
            'cursor-pointer'
        ]
    }">
        <UButton color="neutral" variant="ghost" trailing-icon="i-heroicons-chevron-down-20-solid"
            :label="currentLocale.toUpperCase()" :title="$t('language_switcher')" />
    </UDropdownMenu>
</template>
