<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
  @reference "tailwindcss";

@reference base from "@/app/assets/css/main.css";
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Base styles */
html {
  @apply antialiased;
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
}

body {
  @apply bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100;
  font-feature-settings: 'rlig' 1, 'calt' 1;
}
</style>
