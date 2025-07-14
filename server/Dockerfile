# Stage 1: Builder
FROM node:18 AS builder

WORKDIR /server

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Optional checks
RUN npm run lint
RUN npm run type-check
#RUN npm test

RUN npm run build

# Stage 2: Production Image
FROM node:18-slim AS runner

WORKDIR /server

# Install only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built app and assets
COPY --from=builder /server/dist ./dist

RUN echo "--- PWD OUTPUT ---" && pwd && echo "--- END ---"

#COPY --from=builder /server/.env .env
RUN ls -R .

ENV NODE_ENV=production
EXPOSE 4000

# Start the compiled app
CMD ["node", "dist/index.js"]
