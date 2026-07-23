# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile

# build the React/Vite SPA (needs dev dependencies)
FROM base AS clientbuild
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM base AS prerelease
COPY --from=install /temp/prod/node_modules node_modules
COPY . .
# ship the built SPA (dist-client) produced by the clientbuild stage
COPY --from=clientbuild /usr/src/app/dist-client ./dist-client

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app .

# install fonts for resvg SVG-to-PNG text rendering
RUN apt-get update && apt-get install --no-install-recommends -y fonts-dejavu-core fontconfig && rm -rf /var/lib/apt/lists/* && fc-cache -f

RUN bunx prisma generate
RUN bunx prisma db push

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "src/index.ts"]
