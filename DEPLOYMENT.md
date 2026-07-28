# Deployment

## Flow

`git push -> CI -> GitHub Actions builds image -> push ACR/GHCR -> server pulls image -> start -> health check`

The production server does not build images locally.

## Production

- Host: `118.25.36.15`
- Domains: `lingcoo.com`, `www.lingcoo.com`
- Path: `/opt/lingcoo-official-website-system`
- Health check: `https://lingcoo.com/health`

## Required GitHub Secrets

- `ACR_REGISTRY`
- `ACR_NAMESPACE`
- `ACR_USERNAME`
- `ACR_PASSWORD`
- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_PATH`
- `DEPLOY_SSH_PRIVATE_KEY`
- `DEPLOY_SSH_KNOWN_HOSTS`
- `DEPLOY_HEALTHCHECK_URL`

Project-specific values:

```text
DEPLOY_HOST=118.25.36.15
DEPLOY_USER=root
DEPLOY_PATH=/opt/lingcoo-official-website-system
DEPLOY_HEALTHCHECK_URL=https://lingcoo.com/health
```

