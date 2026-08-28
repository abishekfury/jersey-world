FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY server/package.json ./server/
COPY shared ./shared

RUN npm install --prefix server

COPY server ./server

RUN npm run build --prefix server

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/shared ./shared

EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "start", "--prefix", "server"]
