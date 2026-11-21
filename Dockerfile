# syntax=docker/dockerfile:1

############################
# 1. Build stage
############################
FROM oven/bun:1 AS builder
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy the rest of the source and build the standalone output
COPY . .
RUN bun run build

############################
# 2. Runtime stage (tiny, no bun needed at runtime)
############################
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Bind to all interfaces so the container is reachable from outside.
# PORT is injected by the platform (Neo App) — Next.js standalone reads it.
ENV HOSTNAME=0.0.0.0

# The build script already merges .next/static and public/ into .next/standalone,
# so this single copy is all we need.
COPY --from=builder /app/.next/standalone ./

EXPOSE 3000

CMD ["node", "server.js"]
