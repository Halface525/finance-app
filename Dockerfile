# 构建阶段 - 前端
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# 构建阶段 - 后端
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
COPY server/tsconfig.json ./
COPY server/src ./src
# 后端构建也可能需要编译 native 模块
RUN apk add --no-cache python3 make g++ && \
    npm ci && \
    npm run build

# 运行阶段
FROM node:20-alpine
WORKDIR /app
# 创建 server 目录结构
WORKDIR /app/server
COPY server/package*.json ./
RUN apk add --no-cache python3 make g++ && \
    npm ci --only=production && \
    apk del python3 make g++

# 从各构建阶段复制产物
COPY --from=server-builder /app/server/dist ./dist
COPY --from=client-builder /app/client/dist ../client/dist

EXPOSE 3000
CMD ["node", "dist/server.js"]
