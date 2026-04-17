FROM node:20-alpine AS build
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
RUN npm ci

# Copy all source
COPY . .

# Build frontend
RUN npm run build

# Setup production server
FROM node:20-alpine
WORKDIR /app/server

# Copy server package files
COPY server/package.json server/package-lock.json ./
RUN npm ci --only=production

# Copy server code
COPY server/ ./

# Copy built frontend from previous stage
COPY --from=build /app/dist /app/dist

# Expose port and start
ENV PORT=5000
EXPOSE 5000

CMD ["npm", "start"]
