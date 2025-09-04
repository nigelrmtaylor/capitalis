// Type declarations for Nuxt and Nuxt i18n composables
type LocaleCode = 'en' | 'fr' | 'de' | 'es'

type Locale = {
  code: LocaleCode
  name: string
  file: string
}

declare function useI18n(): {
  locale: Ref<LocaleCode>
  locales: Ref<Locale[]>
  t: (key: string) => string
}

declare function useSwitchLocalePath(): (locale: LocaleCode) => string

declare function navigateTo(path: string): Promise<void>

declare const computed: <T>(getter: () => T) => { value: T }

declare const defineNuxtComponent: any

type Ref<T> = { value: T }
