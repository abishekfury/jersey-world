FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY client/package.json ./client/
COPY shared ./shared

RUN npm install --prefix client

COPY client ./client

RUN npm run build --prefix client

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/client/dist ./dist
COPY client/package.json ./

RUN npm install -g serve

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
