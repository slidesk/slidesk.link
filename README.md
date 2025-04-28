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
# This was inserted by `prisma init`:
# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema
# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings
DATABASE_URL="file:../YOUR_DB.db"
```

2. install it

```bash
bun install
bunx prisma db push
bun web
```
