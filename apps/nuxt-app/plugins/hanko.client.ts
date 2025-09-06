import { Hanko } from '@teamhanko/hanko-frontend-sdk';
import { defineNuxtPlugin, useRuntimeConfig } from '#imports';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  let hankoInstance: Hanko | null = null;

  // Ensure the API URL is available
  if (config.public.hankoApiUrl) {
    hankoInstance = new Hanko(config.public.hankoApiUrl);
  } else {
    console.warn('Hanko API URL is not configured. Please set hankoApiUrl in your runtime config.');
  }

  return {
    provide: {
      hanko: () => hankoInstance
    }
  };
});

// Type declaration for the plugin
declare module '#app' {
  interface NuxtApp {
    $hanko: () => Hanko | null;
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $hanko: () => Hanko | null;
  }
}
