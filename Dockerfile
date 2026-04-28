# Base image for building
FROM node:20-alpine AS builder

# Install build dependencies for native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN DATABASE_URL="postgresql://neondb_owner:npg_usw7cWiZFyH2@ep-ancient-cherry-amof52gc-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma generate
RUN npm run build

# Production image
FROM node:20-alpine

# Install runtime dependencies for Prisma and native modules
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

ENV NODE_ENV=production

# Pre-create uploads directory and set ownership
RUN mkdir -p uploads && chown -R node:node /app

# Install only production dependencies
COPY --chown=node:node package*.json ./
RUN npm ci --only=production

# Copy the built application and Prisma artifacts
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=node:node /app/prisma ./prisma

EXPOSE 3000

USER node

CMD ["node", "dist/src/main"]
