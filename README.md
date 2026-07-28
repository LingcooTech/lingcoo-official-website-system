# Lingcoo Official Website System

Lingcoo 公司官网系统。域名：`lingcoo.com`。

这是一个**轻量化自建官网**：对齐 Lingcoo 三套系统（`lingcoo-core-stack` / `lingcoo-edu-system` / `lingcoo-retail-system`）的工程架构与 UI 标准，但**不依赖 headless WordPress**，也不引入第三方 CMS。官网内容不多，采用"自建轻量后台 + 静态预渲染前台"的形态。

- **前台 public-web**：React + Vite + Tailwind 4，`vite-react-ssg` 预渲染成真 HTML（保证 SEO / 首屏 / 备案审核可抓取）。
- **后端 api**：Fastify 5 + TypeScript + PostgreSQL（Drizzle ORM）。单进程同时静态托管 `public-web/dist`（`/`）与 `admin-ui/dist`（`/admin/`）。
- **后台 admin-ui**（v2）：React + Vite 轻量内容后台。
- **部署**：Docker（多阶段）+ Caddy + Docker Compose，镜像走 ACR / GHCR。

## 交付阶段

- **v1（备案冲刺）**：仅 public-web，内容硬编码，页脚预留 ICP + 公安备案号。目标：官网上线、挂 ICP、过公安联网备案。
- **v2（备案通过后）**：补齐 `admin-ui` + api 内容模块（页面/新闻/联系表单/站点设置），把硬编码内容迁到自建后台。

## 本地开发

```bash
cp .env.example .env
# 前台
npm run dev:public          # http://localhost:5174
# 后端 API（含静态托管）
npm install && npm run dev  # http://localhost:8090
```

## 常用脚本

```bash
npm run build:all   # 构建前台 + 后端
npm run typecheck
npm run lint
```

镜像与容器健康检查使用 `/health`。
