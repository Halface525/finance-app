FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./server/
COPY server/tsconfig.json ./server/
COPY server/src ./server/src

WORKDIR /app/server

RUN npm ci --only=production

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
