# Deployment

## Flow

`git push -> CI -> build image -> push ACR/GHCR -> server pull -> migrate -> start -> health check`

生产服务器不从源码构建镜像。GitHub Runner 和生产主机都会对 ACR 登录进行有界重试，降低临时 TLS 超时造成的发布失败。

## Production

- Repository: `LingcooTech/lingcoo-official-website-system`
- Host: `118.25.36.15`
- Domains: `lingcoo.com`, `www.lingcoo.com`
- Deploy path: `/opt/lingcoo-official-website-system`
- Canonical site: `https://www.lingcoo.com`
- Health check: `https://www.lingcoo.com/ready`
- Public ports: `80`, `443` (containerized Caddy)

## Required GitHub Secrets

- `ACR_REGISTRY`
- `ACR_NAMESPACE`
- `ACR_USERNAME`
- `ACR_PASSWORD`
- `DEPLOY_SSH_PRIVATE_KEY`
- `DEPLOY_SSH_KNOWN_HOSTS`

The public deployment target is declared in `.github/workflows/deploy.yml`:

```text
DEPLOY_HOST=118.25.36.15
DEPLOY_USER=root
DEPLOY_PATH=/opt/lingcoo-official-website-system
DEPLOY_HEALTHCHECK_URL=https://www.lingcoo.com/ready
```

## Server bootstrap

```bash
git clone https://github.com/LingcooTech/lingcoo-official-website-system.git \
  /opt/lingcoo-official-website-system
cd /opt/lingcoo-official-website-system
cp .env.example .env
```

Production `.env`:

```text
NODE_ENV=production
APP_NAME=lingcoo-official-website-system
API_HOST=0.0.0.0
API_PORT=8090
CORS_ORIGIN=https://lingcoo.com,https://www.lingcoo.com
DATABASE_URL=postgres://lingcoo_official:<password>@postgres:5432/lingcoo_official
POSTGRES_DB=lingcoo_official
POSTGRES_USER=lingcoo_official
POSTGRES_PASSWORD=<password>
SETTINGS_ENCRYPTION_KEY=<at-least-32-random-characters>
AUTH_JWT_SECRET=<at-least-32-random-characters>
AUTH_COOKIE_NAME=lingcoo_official_session
AUTH_SESSION_TTL_HOURS=168
AUTH_BOOTSTRAP_EMAIL=<first-owner-email>
AUTH_BOOTSTRAP_PASSWORD=<temporary-password-at-least-12-characters>
AUTH_BOOTSTRAP_DISPLAY_NAME=系统所有者
LOG_LEVEL=info
METRICS_BEARER_TOKEN=<optional-at-least-24-random-characters>
LINGCOO_OFFICIAL_HTTP_PORT=80
LINGCOO_OFFICIAL_HTTPS_PORT=443
```

首个 Owner 创建后，从 `.env` 删除 `AUTH_BOOTSTRAP_PASSWORD`，并使用首次登录强制改密流程设置正式密码。

Caddy 直接监听公网 `80/443` 并自动管理两个域名的 TLS 证书。`www.lingcoo.com`
是规范域名；`lingcoo.com` 永久重定向到 `www.lingcoo.com`。

部署脚本会在生产 `.env` 缺失时一次性生成并持久化 `AUTH_JWT_SECRET` 与
`SETTINGS_ENCRYPTION_KEY`，后续部署不会轮换这两个密钥。
