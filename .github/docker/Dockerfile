# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# --- build stage: SPA bundle + bundled server ---
FROM base AS build
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# dist-client/ (vite) + dist-server/index.js (bun build). The server bundle
# inlines every dependency and emits the native resvg addon beside it, so the
# release image needs neither the sources nor node_modules.
RUN bun run build

# --- release image: built artifacts only ---
FROM base AS release
ENV NODE_ENV=production

COPY --from=build /usr/src/app/dist-server ./dist-server
COPY --from=build /usr/src/app/dist-client ./dist-client
COPY public ./public

# app dir (content folders); owned by bun so the app can write to the content
# folders and create/migrate the sqlite db (see src/database/migrations) at runtime
COPY --from=build --chown=bun:bun /usr/src/app/app ./app

# fonts for resvg SVG-to-PNG text rendering (OG images)
RUN apt-get update && apt-get install --no-install-recommends -y fonts-dejavu-core fontconfig && rm -rf /var/lib/apt/lists/* && fc-cache -f

# run the built server (web/API + /mcp on the same port)
USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "dist-server/index.js"]
