# 多阶段构建 - 前端构建阶段
FROM node:20-alpine AS client-builder

WORKDIR /app/client

# 复制客户端依赖文件
COPY client/package*.json ./

# 安装依赖
RUN npm ci

# 复制客户端源代码
COPY client/ ./

# 构建前端
RUN npm run build

# 多阶段构建 - 后端构建阶段
FROM node:20-alpine AS server-builder

WORKDIR /app/server

# 复制服务端依赖文件
COPY server/package*.json ./

# 安装依赖
RUN npm ci

# 复制服务端源代码
COPY server/ ./

# 构建后端
RUN npm run build

# 生产阶段
FROM node:20-alpine

WORKDIR /app

# 安装 dumb-init 和 su-exec 用于正确处理信号和权限
RUN apk add --no-cache dumb-init su-exec

# 复制服务端依赖文件并安装生产依赖
COPY server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 复制构建产物
COPY --from=server-builder /app/server/dist ./dist
COPY --from=client-builder /app/client/dist ./public

# 设置数据目录环境变量
ENV DATA_DIR=/app/data

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/items', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 复制入口脚本
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# 使用入口脚本启动应用
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
