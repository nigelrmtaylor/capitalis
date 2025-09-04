# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY .npmrc ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:18-alpine as production

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY .npmrc ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built application from build stage
COPY --from=build /app/.output ./.output

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "./output/server/index.mjs"]
