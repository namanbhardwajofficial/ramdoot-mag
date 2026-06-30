# ==========================================
# RAMDOOT Backend - Dockerfile
# ==========================================

# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN yarn build

# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache tini curl

# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "dist/main"]
