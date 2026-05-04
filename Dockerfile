# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制服务器代码和配置文件
COPY server/package*.json ./server/
COPY server/tsconfig.json ./server/
COPY server/src ./server/src

WORKDIR /app/server

# 安装所有依赖（包括 devDependencies 中的 typescript）
RUN npm ci

# 执行构建
RUN npm run build

# 运行阶段
FROM node:20-alpine

WORKDIR /app/server

# 只复制运行所需的文件
COPY server/package*.json ./

# 安装构建工具以支持 native 模块（如 sqlite3），安装后清理缓存
RUN apk add --no-cache python3 make g++ && \
    npm ci --only=production && \
    apk del python3 make g++

# 从构建阶段复制编译后的 dist 目录
COPY --from=builder /app/server/dist ./dist

# 暴露端口
EXPOSE 3000

# 启动服务器
CMD ["node", "dist/server.js"]
