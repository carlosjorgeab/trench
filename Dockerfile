FROM node:20-alpine

WORKDIR /app

# Install curl for Coolify healthcheck
RUN apk add --no-cache curl libc6-compat

# Install dependencies directly in the container
COPY package.json package-lock.json* ./
RUN npm ci

# Copy application source
COPY . .

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Create non-root user and grant ownership
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node_modules/.bin/next", "start"]
