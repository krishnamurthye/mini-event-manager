# Stage 1: Builder
FROM node:18 AS builder

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy full app *before* lint/type-check
COPY . .

# Optional early fail (after full context is present)
RUN npm run lint
RUN npm run type-check
RUN npm test


# Build app
RUN npm run build


# Stage 2: Runner
FROM node:18 AS runner

WORKDIR /app

# Copy only production assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./

# only for debugging not required.
# COPY --from=builder /app/.env ./.env

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
