ARG NODE_BASE_IMAGE=node:22-alpine

FROM ${NODE_BASE_IMAGE} AS dependencies
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
COPY apps/admin/package.json ./apps/admin/
COPY apps/system/package.json ./apps/system/
COPY apps/web/package.json ./apps/web/
COPY packages/official-site-extension/package.json ./packages/official-site-extension/
RUN --mount=type=secret,id=npm_token \
    NODE_AUTH_TOKEN="$(cat /run/secrets/npm_token)" npm ci

FROM dependencies AS build
COPY . .
RUN npm run build:all
RUN --mount=type=secret,id=npm_token \
    NODE_AUTH_TOKEN="$(cat /run/secrets/npm_token)" npm prune --omit=dev

FROM ${NODE_BASE_IMAGE} AS runtime
ARG APP_VERSION=development
ENV NODE_ENV=production \
    APP_VERSION=${APP_VERSION} \
    API_HOST=0.0.0.0 \
    API_PORT=8090

WORKDIR /app
RUN addgroup -S lingcootech && adduser -S lingcootech -G lingcootech

COPY --from=build --chown=lingcootech:lingcootech /app/package.json /app/package-lock.json ./
COPY --from=build --chown=lingcootech:lingcootech /app/node_modules ./node_modules
COPY --from=build --chown=lingcootech:lingcootech /app/apps/system/package.json ./apps/system/package.json
COPY --from=build --chown=lingcootech:lingcootech /app/apps/system/dist ./apps/system/dist
COPY --from=build --chown=lingcootech:lingcootech /app/apps/admin/dist ./apps/admin/dist
COPY --from=build --chown=lingcootech:lingcootech /app/apps/web/dist ./apps/web/dist
COPY --from=build --chown=lingcootech:lingcootech /app/packages/official-site-extension/package.json ./packages/official-site-extension/package.json
COPY --from=build --chown=lingcootech:lingcootech /app/packages/official-site-extension/dist ./packages/official-site-extension/dist
COPY --from=build --chown=lingcootech:lingcootech /app/packages/official-site-extension/migrations ./packages/official-site-extension/migrations

USER lingcootech
EXPOSE 8090
CMD ["node", "apps/system/dist/server.js"]
