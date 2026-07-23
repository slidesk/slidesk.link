# SliDesk Addons — MCP server

An [MCP](https://modelcontextprotocol.io) server that lets AI agents browse the
SliDesk.link addon hub and install addons. It ships in two flavors that share
the same tools (`mcp/tools.ts`):

- **HTTP (exposed by the deployed server)** — `mcp/elysia.ts`, mounted in the
  main app at **`/mcp`** on the app's own port. Discovery + `install_addon`
  **returns the command to run locally** (nothing is executed on the server).
- **stdio (run locally by the client)** — `mcp/server.ts`. Same tools, but
  `install_addon` actually runs the `slidesk` CLI in your project.

## Tools

| Tool | Description |
| --- | --- |
| `search_addons(query?, kind?)` | Search the hub. Omit `query` (or use `*`) to list everything; omit `kind` for all four kinds. Returns each addon's install command + web URL. |
| `get_addon(kind, user, slug)` | Details for one addon (description, downloads, command, URL). |
| `get_install_command(kind, user, slug)` | The install command as a string. |
| `install_addon(kind, user, slug, cwd?)` | **HTTP:** returns the command to run locally. **stdio:** runs `slidesk <kind> install @user/slug` in `cwd`. |

## HTTP transport (server-exposed)

The main app serves the MCP endpoint on its own port, so it's reachable at
**`https://slidesk.link/mcp`** — no extra port, and no reverse-proxy rule beyond
the one already forwarding the domain to the app.

Search runs against the app itself; addon web links use `HOST`
(default `https://slidesk.link`).

### Register with a client (HTTP)

```sh
claude mcp add --transport http slidesk-addons https://slidesk.link/mcp
```

```json
{
  "mcpServers": {
    "slidesk-addons": { "type": "http", "url": "https://slidesk.link/mcp" }
  }
}
```

## stdio transport (local, with real install)

Run on the machine that has the `slidesk` CLI and your SliDesk project:

```sh
bun run mcp        # or: bun mcp/server.ts
```

```sh
claude mcp add slidesk-addons -- bun /absolute/path/to/slidesk.link/mcp/server.ts
```

| Env | Default | Purpose |
| --- | --- | --- |
| `SLIDESK_HOST` | `https://slidesk.link` | Hub base URL used for search. |
| `SLIDESK_BIN` | `slidesk` | Path to the `slidesk` CLI (stdio `install_addon`). |

## Safety

`install_addon` is only ever *executed* by the local stdio server, and even then
it spawns the CLI with an argument array (no shell) with `user`/`slug` validated
against `^[A-Za-z0-9_-]+$` — no command-injection surface. The exposed HTTP
server never executes anything: it only returns the command for the client.
