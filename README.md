# slidesk.link
Hub

This website allows users to have a page which contains all their talks and sessions.

They can host their own presentations for 72h.

To host your own slidesk.link hub, you have to clone it and:

1. Create a `.env` file with this following keys:

```
GITHUB_OAUTH_CLIENT_ID=
GITHUB_OAUTH_CLIENT_SECRET=
JWT_SECRET=YOUR_SECRET
# Optional: where the sqlite file lives (default: ./app/dev.db).
DATABASE_PATH=./app/dev.db
```

2. install it

```bash
bun install
bun web
```

The sqlite file is created and migrated on startup, so there is no separate
migration command.

### Database migrations

Migrations live in `src/database/migrations` as plain `.sql` files and are
applied on startup, tracked by sqlite's `PRAGMA user_version`. Each one runs in
its own transaction, and a database already at the latest version does no work.

To add one:

1. create `src/database/migrations/NNN_short_name.sql`;
2. append it to the `MIGRATIONS` array in `src/database/migrations/index.ts`
   with the next version number.

Migrations are imported statically so their SQL is embedded in the server
bundle. Because they run inside a transaction they cannot toggle
`PRAGMA foreign_keys`, which the app enables at startup.

### Build

```bash
bun run build         # both of the below
bun run build:client  # vite  -> dist-client
bun run build:server  # bun build -> dist-server/index.js
```

The server bundle inlines every dependency and emits the native resvg addon
beside it, so the Docker release image ships only `dist-server`, `dist-client`,
`public` and `app` — no sources and no `node_modules`.
