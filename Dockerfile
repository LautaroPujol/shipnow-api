# ---- Etapa 1: dependencias ----
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# ---- Etapa 2: imagen final de producción ----
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src

EXPOSE 3000

CMD ["node", "src/server.js"]