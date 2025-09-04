# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./

# Copy app-specific files
COPY apps/nuxt-app/package.json ./apps/nuxt-app/

# Install all dependencies (first without frozen lockfile to generate it if needed)
RUN pnpm install --no-frozen-lockfile && pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Set working directory to the app
WORKDIR /app/apps/nuxt-app

# Build the application
RUN pnpm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy built application and production dependencies from build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/nuxt-app/.output ./.output

# Ensure the node_modules/.bin is in PATH
ENV PATH="/app/node_modules/.bin:$PATH"

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "./output/server/index.mjs"]
