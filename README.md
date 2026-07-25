# Things

一个面向个人与家庭场景的物品管理系统，用来记录物品放在哪里、属于什么分类、带有哪些标签，以及何时购入、生产或到期。

项目采用 React + TypeScript 构建前端，Express + TypeScript 提供 API，数据以 JSON 文件保存。无需数据库即可运行，适合部署在家用服务器、NAS 或个人电脑上。

## 功能

- 物品新增、编辑、删除与详情查看
- 按名称、分类、标签和描述搜索，支持中文拼音搜索
- 分类、标签和树状位置管理
- 位置筛选、分类筛选和标签筛选
- 物品数量与备注
- 可选的购入日期、生产日期、到期日期和提前提醒
- 自动显示保质期正常、即将到期、今天到期或已过期
- 物品移动与位置变更记录
- 批量移动、修改分类、修改标签和删除
- 位置二维码、扫码定位和批量打印
- 总览页面：核心统计、分类分布、位置分布和最近更新
- 桌面端与移动端响应式布局

## 技术栈

| 部分 | 技术 |
| --- | --- |
| 前端 | React 18、TypeScript、Vite、React Router |
| 后端 | Node.js、Express、TypeScript |
| 数据 | JSON 文件 |
| 其他 | pinyin-pro、qrcode.react、Docker |

## 快速开始

### 环境要求

- Node.js 20 或更高版本
- npm

### 本地开发

安装根目录、服务端和客户端的全部依赖：

```bash
npm run install:all
```

同时启动前后端：

```bash
npm run dev
```

打开：

```text
http://localhost:5173
```

开发环境端口：

- 前端：`5173`
- 后端 API：`3001`
- Vite 会将 `/api` 请求代理到后端

也可以分别启动：

```bash
npm run dev:server
npm run dev:client
```

### 构建检查

分别构建客户端和服务端：

```bash
cd client
npm run build

cd ../server
npm run build
```

## Docker

### 本地构建并运行

构建镜像：

```bash
docker build -t things:local .
```

创建持久化数据卷：

```bash
docker volume create things-data
```

运行容器：

```bash
docker run -d \
  --name things \
  --restart unless-stopped \
  -p 3001:3001 \
  -v things-data:/app/data \
  things:local
```

打开：

```text
http://localhost:3001
```

### Docker Compose

仓库中的 `docker-compose.yml` 默认使用以下示例镜像：

```text
ghcr.io/YOUR_USERNAME/things:latest
```

使用前请将 `YOUR_USERNAME` 替换为实际的 GitHub 用户名或组织名，并确保对应镜像已经发布。

然后运行：

```bash
docker compose up -d
```

Compose 默认将宿主机的 `./data` 挂载到容器的 `/app/data`。

## 数据存储

默认数据目录为仓库根目录下的 `data/`。首次运行时会自动创建以下文件：

```text
data/
├── categories.json
├── items.json
├── locations.json
├── moveRecords.json
└── tags.json
```

所有数据都保存在这些 JSON 文件中。备份时复制整个 `data/` 目录即可；恢复时停止应用并替换该目录。

可通过环境变量修改数据目录：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `3001` | 服务端监听端口 |
| `DATA_DIR` | 项目根目录下的 `data/` | JSON 数据目录 |
| `NODE_ENV` | 未设置 | 运行环境 |

## 搜索

普通关键词会同时匹配物品名称、分类、标签和描述，并支持中文拼音。

也可以使用字段前缀缩小范围：

```text
name:充电器
cat:电子产品
category:电子产品
tag:常用
desc:备用
```

多个关键词可用空格组合。

## 保质期

物品可以选择性记录：

- 购入日期
- 生产日期
- 到期日期
- 提前提醒天数

只有填写到期日期时才会显示到期状态。提前提醒默认是 7 天，可在物品表单中调整。未设置日期的旧物品不受影响，也不需要迁移数据。

## API

API 基础路径为 `/api`。

### 物品

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/items` | 查询物品，支持搜索和筛选参数 |
| `POST` | `/api/items` | 新增物品 |
| `GET` | `/api/items/:id` | 获取物品详情 |
| `PUT` | `/api/items/:id` | 更新物品 |
| `DELETE` | `/api/items/:id` | 删除物品 |
| `POST` | `/api/items/:id/move` | 移动物品 |
| `GET` | `/api/items/:id/history` | 获取移动记录 |
| `PUT` | `/api/items/batch` | 批量更新 |
| `DELETE` | `/api/items/batch` | 批量删除 |

`GET /api/items` 支持以下查询参数：

| 参数 | 说明 |
| --- | --- |
| `search` | 搜索关键词 |
| `category` | 分类名称 |
| `tag` | 标签名称 |
| `locationId` | 位置 ID |

### 分类、标签和位置

以下资源均提供查询、新增、更新和删除接口：

```text
/api/categories
/api/tags
/api/locations
```

## 项目结构

```text
things/
├── client/                 # React 前端
│   └── src/
│       ├── api/            # API 客户端
│       ├── components/     # 通用组件
│       ├── pages/          # 页面
│       ├── types/          # 前端类型
│       └── utils/          # 工具函数
├── server/                 # Express 服务端
│   └── src/
│       ├── routes/         # API 路由
│       ├── index.ts        # 服务入口
│       ├── store.ts        # JSON 存储
│       └── types.ts        # 服务端类型
├── data/                   # 运行时数据，首次启动后生成
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 部署提示

- 请持久化 `DATA_DIR`，否则容器重建后数据会丢失。
- 建议定期备份数据目录。
- 当前版本没有账号登录和权限控制。若部署到公网，请在反向代理层增加身份验证，并启用 HTTPS。
- Docker 镜像已包含前端静态文件，容器启动后只需要暴露服务端端口。
