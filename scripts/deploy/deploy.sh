#!/bin/sh

set -eu

: "${DEPLOY_PATH:?DEPLOY_PATH is required}"
: "${ACR_REGISTRY:?ACR_REGISTRY is required}"
: "${ACR_USERNAME:?ACR_USERNAME is required}"
: "${ACR_PASSWORD:?ACR_PASSWORD is required}"
: "${LINGCOO_OFFICIAL_IMAGE_NAME:?LINGCOO_OFFICIAL_IMAGE_NAME is required}"
: "${IMAGE_TAG:?IMAGE_TAG is required}"

DEPLOY_COMPOSE_FILE="${DEPLOY_COMPOSE_FILE:-docker-compose.prod.yml}"
DEPLOY_HEALTHCHECK_URL="${DEPLOY_HEALTHCHECK_URL:-https://www.lingcoo.com/ready}"
LINGCOO_OFFICIAL_RUNTIME_IMAGE="${LINGCOO_OFFICIAL_IMAGE_NAME}:${IMAGE_TAG}"
APP_VERSION="${IMAGE_TAG}"

if docker compose version >/dev/null 2>&1; then
  compose() {
    docker compose "$@"
  }
elif command -v docker-compose >/dev/null 2>&1; then
  compose() {
    docker-compose "$@"
  }
else
  echo "Docker Compose is required (docker compose or docker-compose)"
  exit 1
fi

cleanup_docker_space() {
  docker container prune -f >/dev/null 2>&1 || true
  docker image prune -af >/dev/null 2>&1 || true
  docker builder prune -af >/dev/null 2>&1 || true
}

ensure_env_secret() {
  secret_name="$1"
  current_value="$(sed -n "s/^${secret_name}=//p" .env | tail -n 1)"
  if [ "${#current_value}" -ge 32 ]; then
    return 0
  fi

  if ! command -v openssl >/dev/null 2>&1; then
    echo "openssl is required to initialize ${secret_name}"
    exit 1
  fi

  secret_value="$(openssl rand -hex 32)"
  temporary_env="$(mktemp "${DEPLOY_PATH}/.env.tmp.XXXXXX")"
  awk -v key="${secret_name}" -v value="${secret_value}" '
    BEGIN { replaced = 0 }
    $0 ~ "^" key "=" {
      if (!replaced) {
        print key "=" value
        replaced = 1
      }
      next
    }
    { print }
    END {
      if (!replaced) print key "=" value
    }
  ' .env > "${temporary_env}"
  chmod 600 "${temporary_env}"
  mv "${temporary_env}" .env
  echo "Initialized ${secret_name} in the production environment"
}

ensure_bootstrap_owner() {
  account_count="$(
    compose -f "${DEPLOY_COMPOSE_FILE}" exec -T postgres sh -c \
      'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "select count(*) from accounts"' |
      tr -d '[:space:]'
  )"
  case "${account_count}" in
    0)
      for setting_name in AUTH_BOOTSTRAP_EMAIL AUTH_BOOTSTRAP_PASSWORD AUTH_BOOTSTRAP_DISPLAY_NAME; do
        current_value="$(sed -n "s/^${setting_name}=//p" .env | tail -n 1)"
        if [ -z "${current_value}" ]; then
          echo "${setting_name} must be set before the first production deployment"
          exit 1
        fi
      done
      ;;
    '' | *[!0-9]*)
      echo "Unable to determine the production account count"
      exit 1
      ;;
    *)
      echo "Existing accounts found; bootstrap owner initialization skipped"
      ;;
  esac
}

login_acr() {
  login_attempt=1
  login_max_attempts=5
  while [ "${login_attempt}" -le "${login_max_attempts}" ]; do
    if printf '%s' "${ACR_PASSWORD}" |
      docker login "${ACR_REGISTRY}" --username "${ACR_USERNAME}" --password-stdin; then
      return 0
    fi
    if [ "${login_attempt}" -eq "${login_max_attempts}" ]; then
      echo "ACR login failed after ${login_attempt} attempts"
      return 1
    fi
    login_wait_s=$((login_attempt * 15))
    echo "ACR login failed (${login_attempt}/${login_max_attempts}); retrying in ${login_wait_s}s"
    sleep "${login_wait_s}"
    login_attempt=$((login_attempt + 1))
  done
}

cd "${DEPLOY_PATH}"

git fetch --prune origin
git checkout main
git reset --hard origin/main

if [ ! -f .env ]; then
  echo "Production environment file is missing: ${DEPLOY_PATH}/.env"
  exit 1
fi

ensure_env_secret AUTH_JWT_SECRET
ensure_env_secret SETTINGS_ENCRYPTION_KEY

login_acr

export APP_VERSION
export LINGCOO_OFFICIAL_RUNTIME_IMAGE

compose -f "${DEPLOY_COMPOSE_FILE}" config >/dev/null
cleanup_docker_space
if ! compose -f "${DEPLOY_COMPOSE_FILE}" pull api; then
  cleanup_docker_space
  compose -f "${DEPLOY_COMPOSE_FILE}" pull api
fi
compose -f "${DEPLOY_COMPOSE_FILE}" up -d postgres
compose -f "${DEPLOY_COMPOSE_FILE}" run --rm \
  api node apps/system/dist/migrate.js
ensure_bootstrap_owner
compose -f "${DEPLOY_COMPOSE_FILE}" up -d --remove-orphans api worker caddy
cleanup_docker_space

worker_container_id="$(compose -f "${DEPLOY_COMPOSE_FILE}" ps -q worker)"
if [ -z "${worker_container_id}" ]; then
  echo "worker container was not created"
  exit 1
fi

worker_attempt=1
while [ "${worker_attempt}" -le 24 ]; do
  worker_status="$(docker inspect --format '{{.State.Health.Status}}' "${worker_container_id}" 2>/dev/null || true)"
  if [ "${worker_status}" = "healthy" ]; then
    echo "worker health check passed on attempt ${worker_attempt}"
    break
  fi
  if [ "${worker_attempt}" -eq 24 ]; then
    echo "worker health check failed: ${worker_status:-unknown}"
    compose -f "${DEPLOY_COMPOSE_FILE}" logs --tail=100 worker || true
    exit 1
  fi
  worker_attempt=$((worker_attempt + 1))
  sleep 5
done

attempt=1
max_attempts=30

while [ "${attempt}" -le "${max_attempts}" ]; do
  if curl -fsS "${DEPLOY_HEALTHCHECK_URL}" >/dev/null; then
    echo "health check passed on attempt ${attempt}"
    exit 0
  fi

  echo "health check pending (${attempt}/${max_attempts})"
  attempt=$((attempt + 1))
  sleep 5
done

echo "deployment health check failed"
exit 1
