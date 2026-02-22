# apps/api/Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Install deps
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/dist          ./dist
COPY --from=builder /app/node_modules  ./node_modules
COPY --from=builder /app/prisma        ./prisma
COPY package*.json ./

EXPOSE 5000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
