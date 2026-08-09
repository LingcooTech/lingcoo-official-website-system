# Deployment

## Flow

`push main -> CI（空库迁移 + check + build）-> 构建镜像 -> ACR/GHCR -> 服务器迁移 -> API/Worker/Caddy -> /ready`

生产服务器不安装 npm 包，也不从源码构建镜像。GitHub Runner 使用 `GITHUB_TOKEN` 和 `packages: read`
安装 `@lingcootech/*`；Docker BuildKit 以 secret mount 传入令牌，不写入镜像层。

## Production

- Repository: `LingcooTech/lingcoo-official-website-system`
- Host: `118.25.36.15`
- Domains: `lingcoo.com`, `www.lingcoo.com`
- Deploy path: `/opt/lingcoo-official-website-system`
- Canonical site: `https://www.lingcoo.com`
- Health check: `https://www.lingcoo.com/ready`
- Public ports: `80`, `443`（容器化 Caddy）

## Required GitHub access

Repository Actions permissions:

- `contents: read`
- `packages: read` for CI/Docker dependency installation
- `packages: write` for the optional GHCR mirror job

The eight `@lingcootech/frame*` GitHub Packages must grant Actions access to this repository.

Required repository secrets:

- `ACR_REGISTRY`
- `ACR_NAMESPACE`
- `ACR_USERNAME`
- `ACR_PASSWORD`
- `DEPLOY_SSH_PRIVATE_KEY`
- `DEPLOY_SSH_KNOWN_HOSTS`

## Server bootstrap

```bash
git clone https://github.com/LingcooTech/lingcoo-official-website-system.git \
  /opt/lingcoo-official-website-system
cd /opt/lingcoo-official-website-system
cp .env.example .env
chmod 600 .env
```

Production `.env` must provide:

```text
NODE_ENV=production
APP_NAME=lingcoo-official-website-system
API_HOST=0.0.0.0
API_PORT=8090
CORS_ORIGIN=https://lingcoo.com,https://www.lingcoo.com
DATABASE_URL=postgres://lingcoo_official:<password>@postgres:5432/lingcoo_official
POSTGRES_DB=lingcoo_official
POSTGRES_USER=lingcoo_official
POSTGRES_PASSWORD=<strong-password>
SETTINGS_ENCRYPTION_KEY=<at-least-32-random-characters>
AUTH_JWT_SECRET=<at-least-32-random-characters>
AUTH_COOKIE_NAME=lingcoo_official_session
AUTH_SESSION_TTL_HOURS=168
AUTH_BOOTSTRAP_EMAIL=<owner-email>
AUTH_BOOTSTRAP_PASSWORD=<unique-temporary-password>
AUTH_BOOTSTRAP_DISPLAY_NAME=<owner-display-name>
LOG_LEVEL=info
METRICS_BEARER_TOKEN=<optional-at-least-24-random-characters>
LINGCOO_OFFICIAL_HTTP_PORT=80
LINGCOO_OFFICIAL_HTTPS_PORT=443
```

部署脚本会在缺失时生成并持久化 `AUTH_JWT_SECRET` 与 `SETTINGS_ENCRYPTION_KEY`。空账号表首次部署必须显式
提供 Bootstrap Owner 三项配置；脚本不会使用仓库内的固定生产密码。账号创建后，后续部署不会覆盖账号或
密码，首次登录仍会强制修改临时密码。

Caddy 直接监听公网 `80/443` 并自动管理两个域名的 TLS 证书；`lingcoo.com` 永久重定向到规范域名
`www.lingcoo.com`。
