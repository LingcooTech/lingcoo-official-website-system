# LingcooTech Official Website System

LingcooTech 官网、内容发布与联系线索运营系统。它是 Lingcoo Frame 的第一个独立 Consumer，生产域名为
`lingcoo.com`。

这个仓库不包含 Frame 源码。认证、权限、设置、审计、通知、任务、资源、CMS、后台壳和公开站点壳均从
GitHub Packages 安装的 `@lingcootech/*@0.7.1` 提供；仓库只维护官网领域扩展和三个组合入口。

## 仓库结构

```text
apps/system                         API、Worker、迁移与扩展组合
apps/admin                          Frame 后台 + CMS + 官网运营页面
apps/web                            Frame 公开站点 + CMS + 官网首页
packages/official-site-extension   官网 Manifest、迁移、咨询服务、API 和 UI
```

官网扩展只有一个领域迁移 `official-site/0001_initial.sql`。Frame 与 CMS 迁移来自安装包，并由
`defineSystem()` 根据依赖拓扑统一执行。

## 当前能力

- 官网首页：解决方案、交付方法和联系转化页面
- CMS：页面、文章、版本、预览、发布、SEO 和 Sitemap
- 联系线索：公开提交、隐私同意、蜜罐、敏感端点限流、分配、状态和内部备注
- 运营后台：直接复用 Frame 默认后台与 CMS，只添加官网概览和联系线索页面
- 运行能力：审计、Outbox、通知 Worker、健康检查、结构化日志与静态站点托管
- 部署：PostgreSQL 17、Docker Compose、Caddy、ACR/GHCR 和 GitHub Actions

## 安装 Frame 包

Frame 包位于 GitHub Packages。开发者令牌需要 `read:packages`；不要把令牌写进 `.npmrc` 或提交到仓库。

```bash
gh auth refresh -h github.com -s read:packages
NODE_AUTH_TOKEN="$(gh auth token)" npm install
```

仓库内 `.npmrc` 只声明 `@lingcootech` registry，并从 `NODE_AUTH_TOKEN` 读取凭据。CI 使用权限为
`packages: read` 的仓库 `GITHUB_TOKEN`，Docker 通过 BuildKit secret 安装依赖，令牌不会进入镜像层。

## 本地开发

要求 Node.js 22+、PostgreSQL 17+ 和 Docker。

```bash
cp .env.example .env
# 在 .env 中设置至少 32 字符的 AUTH_JWT_SECRET、SETTINGS_ENCRYPTION_KEY，
# 并为首次启动设置自己的 AUTH_BOOTSTRAP_EMAIL / AUTH_BOOTSTRAP_PASSWORD。
docker compose up -d postgres
npm run build:packages
npm run build:system
npm run db:migrate
```

分别启动四个运行面：

```bash
npm run dev:api
npm run dev:worker
npm run dev:web
npm run dev:admin
```

- 官网：<http://localhost:5174>
- 运营后台：<http://localhost:5173/admin/>
- API：<http://localhost:8090>
- PostgreSQL：`127.0.0.1:5438`

Bootstrap Owner 只会在账号表为空时创建，并在首次登录后强制修改临时密码。

## 质量检查

```bash
npm run check
npm run build:all
npm audit --omit=dev --audit-level=high
```

CI 会创建真实空 PostgreSQL，执行 Frame、CMS、官网扩展的全部迁移，然后检查类型、测试、lint 和生产构建。

## 开发边界

新增官网业务时，在 `packages/official-site-extension` 内按完整垂直切片交付：

```text
Manifest -> Migration -> Schema -> Service -> API -> Permission -> Audit/Event -> Admin/Web UI -> Test
```

应用不得从 Frame Git 仓库相对引用文件，也不得复制 Frame 页面、数据库 Schema 或基础模块。需要新的通用
能力时，先在 Frame 中形成包导出并发布新版本，再升级这里的精确依赖版本；官网专属能力留在本仓库。

生产部署说明见 [`DEPLOYMENT.md`](DEPLOYMENT.md)。
