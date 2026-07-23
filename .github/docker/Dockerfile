# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# --- build stage: full deps → SPA bundle + generated Prisma client ---
FROM base AS build
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
RUN bunx prisma generate
# apply the schema to the sqlite db here — the build stage has the full deps
# (prisma, @prisma/config, dotenv) that prisma.config.ts needs to load; the
# prod-deps stage does not, so this cannot run in the release image
RUN bunx prisma db push

# --- runtime deps only: excludes the client/build toolchain (vite, react,
#     radix, tailwind, pdfjs, …), keeping the image small ---
FROM base AS prod-deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# --- release image: server source + prod deps + built artifacts ---
FROM base AS release
ENV NODE_ENV=production
COPY --from=prod-deps /usr/src/app/node_modules node_modules

# server code and config only (the client/ source is not needed at runtime)
COPY src ./src
COPY mcp ./mcp
COPY prisma ./prisma
COPY public ./public
COPY package.json bun.lock prisma.config.ts tsconfig.json ./

# app dir (content folders + the sqlite db already provisioned in the build stage);
# owned by bun so the app can write to the db and content folders at runtime
COPY --from=build --chown=bun:bun /usr/src/app/app ./app

# built SPA + generated Prisma client from the build stage
COPY --from=build /usr/src/app/dist-client ./dist-client
COPY --from=build /usr/src/app/src/generated ./src/generated

# fonts for resvg SVG-to-PNG text rendering (OG images)
RUN apt-get update && apt-get install --no-install-recommends -y fonts-dejavu-core fontconfig && rm -rf /var/lib/apt/lists/* && fc-cache -f

# run the app (web/API + /mcp on the same port)
USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "src/index.ts"]
