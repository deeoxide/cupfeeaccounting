# Stage 1: Build the React Frontend
FROM node:24-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build the Express Backend
FROM node:24-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
# We need to build the TypeScript server
RUN npm run build

# Stage 3: Final Production Image
FROM node:24-alpine
WORKDIR /app

# Copy built server
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/package*.json ./server/
COPY --from=server-builder /app/server/node_modules ./server/node_modules

# Copy built client (to be served by Express)
COPY --from=client-builder /app/client/dist ./client/dist

# Copy root package.json for start scripts (optional but helpful)
COPY package*.json ./

EXPOSE 3000

# Start the server
CMD ["node", "server/dist/index.js"]
