import { defineNuxtPlugin } from '#imports';
import { Hanko } from '@teamhanko/hanko-frontend-sdk';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  
  const hanko = new Hanko(config.public.hankoApiUrl);
  
  return {
    provide: {
      hanko: () => hanko
    }
  };
});
