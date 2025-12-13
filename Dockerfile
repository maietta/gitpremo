ARG BUN_VERSION=latest
FROM oven/bun:${BUN_VERSION} AS builder

WORKDIR /app
ENV NODE_ENV=production

# Copy package files first
COPY --link package.json bun.lock* ./

# Install dependencies
RUN bun install --ci

# Copy source files (excluding node_modules and build artifacts)
COPY --link src/ ./src/
COPY --link svelte.config.js tsconfig.json vite.config.ts ./
# Copy static files (images, robots.txt, etc.)
COPY --link static/ ./static/
# Copy optional config files if they exist
COPY --link tailwind.config.js* drizzle.config.ts* playwright.config.ts* eslint.config.js* ./

# Build the application
# Note: Using @sveltejs/adapter-node which works perfectly with Bun runtime
# Set dummy env vars for Better Auth during build (will be overridden at runtime)
RUN bun --bun run build

FROM oven/bun:${BUN_VERSION} AS runtime

# Install curl for healthcheck
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  curl \
  git \
  openssh-client \
  ca-certificates && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV PROTOCOL_HEADER=x-forwarded-proto
ENV HOST_HEADER=x-forwarded-host

# Install production dependencies
COPY --link package.json bun.lock* ./
RUN bun install --ci --production

# Copy SvelteKit adapter-node build output
COPY --from=builder --chown=bun:bun /app/build ./build

EXPOSE 3000/tcp
VOLUME /app/data

# Set user and define healthcheck
USER bun

# Healthcheck using HEAD request
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl --head --fail --silent --output /dev/null http://localhost:3000/ || exit 1

# Run with Bun runtime directly (no compile). Adapter-node entrypoint is build/index.js
CMD ["bun", "--bun", "build/index.js"]