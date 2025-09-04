// Define the shape of our i18n configuration
declare module '#i18n' {
  export type LocaleCode = 'en' | 'fr' | 'de' | 'es';

  export interface LocaleObject {
    code: LocaleCode;
    file: string;
    name?: string;
  }

  export interface I18nConfig {
    locales: LocaleObject[];
    defaultLocale: string;
    // Add other i18n config properties as needed
  }

  export const config: I18nConfig;
}
