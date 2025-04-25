# 1. Builder stage: compile TS to JS
FROM node:16-alpine AS builder
WORKDIR /usr/src/app

# 1.1 Copy package files & install deps
COPY package*.json ./
RUN npm ci

# 1.2 Copy source & build
COPY . .
RUN npm run build

# 2. Runtime stage: slim production image
FROM node:16-alpine
WORKDIR /usr/src/app

# 2.1 Install only production deps
COPY package*.json ./
RUN npm ci --only=production

# 2.2 Copy compiled code from builder
COPY --from=builder /usr/src/app/dist ./dist

# 3. Expose port & start
EXPOSE 3000
CMD ["node", "dist/main.js"]
