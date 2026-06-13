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

# 安装 dumb-init 用于正确处理信号
RUN apk add --no-cache dumb-init

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 复制服务端依赖文件并安装生产依赖
COPY server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 复制构建产物
COPY --from=server-builder /app/server/dist ./dist
COPY --from=client-builder /app/client/dist ./public

# 创建数据目录
RUN mkdir -p /app/data && chown -R nodejs:nodejs /app

# 设置数据目录环境变量
ENV DATA_DIR=/app/data

# 切换到非 root 用户
USER nodejs

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/items', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 使用 dumb-init 启动应用
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
