# Capitalis

A modern web application built with Nuxt 3, TypeScript, and Tailwind CSS.

## Project Structure

- `apps/nuxt-app` - Main Nuxt 3 application
- `packages/` - Shared packages and libraries

## Icon System

This project uses [Nuxt Icons](https://nuxt.com/modules/icons) for icon management. It provides access to the following icon sets:

- **Heroicons** - `heroicons:icon-name`
- **Material Design Icons** - `mdi:icon-name`
- **Simple Icons** - `simple-icons:icon-name`
- And many more from [Iconify](https://icon-sets.iconify.design/)

### Usage

```vue
<template>
  <Icon name="heroicons:envelope" />
  <Icon name="mdi:github" />
</template>
```

## Development

### Prerequisites

- Node.js 18+
- pnpm

### Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

## Environment Variables

See `.env.example` for required environment variables.
