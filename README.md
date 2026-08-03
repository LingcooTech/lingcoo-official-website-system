# Lingcoo Official Website System

Lingcoo 公司官网、内容发布与联系线索运营系统，生产域名为 `lingcoo.com`。

项目基于 `lingcoo-system-base-framework@0.1.0`（commit `9aa93e3`）派生。frame 提供认证、权限、CMS、媒体资源、品牌设置、审计、通知、任务、可观测性和部署基础；官网仓库只维护官网内容、公开体验和领域模块。

## 当前能力

- 官网首页：行业解决方案、交付方法与联系转化页面
- 公开站点：响应式站点壳、品牌设置、SEO、Sitemap、Robots、404/500
- 内容运营：通用页面与文章、Markdown、版本、预览、定时发布和重定向
- 联系线索：公开提交、隐私同意、蜜罐、限流、状态、负责人和内部备注
- 运营后台：内容、媒体资源、联系线索、品牌、通知、账号权限和系统运行入口
- 运营保障：事务 Outbox、站内通知、审计记录、Worker、健康检查和结构化日志
- 自部署：PostgreSQL、Docker Compose、Caddy、ACR/GHCR 和 GitHub Actions

派生来源、运行面和领域模块记录在 [`lingcoo.system.json`](lingcoo.system.json)。

## 本地开发

要求 Node.js 22+、PostgreSQL 17+。推荐使用 Docker Compose 启动数据库：

```bash
cp .env.example .env
npm install
docker compose up -d postgres
npm run db:migrate
```

首次启动前，在 `.env` 临时配置：

```text
AUTH_BOOTSTRAP_EMAIL=<owner email>
AUTH_BOOTSTRAP_PASSWORD=<temporary password, at least 12 characters>
AUTH_JWT_SECRET=<at least 32 characters>
```

随后分别启动：

```bash
npm run dev:api
npm run dev:worker
npm run dev:public
npm run dev:admin
```

- 官网：<http://localhost:5174>
- 运营后台：<http://localhost:5173/admin/>
- API：<http://localhost:8090>
- PostgreSQL：`127.0.0.1:5438`

## 质量检查

```bash
npm run check
npm run build:all
```

数据库集成测试需要 `DATABASE_URL` 指向已经执行全部迁移的 PostgreSQL。CI 会创建真实 PostgreSQL、执行迁移，然后运行完整检查和构建。

## 领域边界

官网领域模块位于 `src/modules/inquiries`，包含公开提交、运营查询、状态更新、审计和事件策略。CMS、品牌、资源、权限等继续由 frame 基础模块维护，不在官网领域内重复实现。

新增官网业务时按完整垂直切片交付：

```text
Migration -> Schema -> Service -> API -> Permission -> Audit/Event -> Admin/Public UI -> Test
```

生产部署说明见 [`DEPLOYMENT.md`](DEPLOYMENT.md)。
