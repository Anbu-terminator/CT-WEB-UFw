# Stage 1 - Build
FROM node:18-alpine as builder
WORKDIR /app

# Install client dependencies
COPY client/package.json client/package-lock.json ./client/
RUN npm ci --prefix client

# Install server dependencies
COPY server/package.json server/package-lock.json ./server/
RUN npm ci --prefix server

# Copy source files
COPY . .

# Build both client and server
RUN npm run build --prefix client
RUN npm run build --prefix server

# Stage 2 - Production
FROM node:18-alpine
WORKDIR /app

# Copy built assets
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/build ./server/build

# Copy production dependencies
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/server/package-lock.json ./server/

# Install production dependencies
RUN npm ci --production --prefix server

# Configure environment
ENV NODE_ENV production
ENV PORT 3000
EXPOSE 3000

# Start the server
CMD ["node", "server/build/index.js"]