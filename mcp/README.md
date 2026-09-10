# SliDesk Addons — MCP server

An [MCP](https://modelcontextprotocol.io) server that lets AI agents browse the
SliDesk.link addon hub and install addons. It ships in two flavors that share
the same tools (`mcp/tools.ts`):

- **HTTP (exposed by the deployed server)** — `mcp/elysia.ts`, mounted in the
  main app at **`/mcp`** on the app's own port. Nothing to install, nothing to
  clone: a URL is the whole setup. Discovery + `install_addon` **returns the
  command to run locally** (nothing is executed on the server).
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

### Stateless, and why that matters to a client

The endpoint answers **one POST with one JSON body**. It issues no
`mcp-session-id`, keeps nothing between requests, and needs no `initialize`
before a `tools/list` — a fresh server is built per request, which is affordable
because the tools hold no per-session state.

That is a deliberate replacement for a session-keyed version that kept a `Map`
of servers, and it removed three problems rather than one:

| Before | Now |
| --- | --- |
| A session this process no longer knew was refused `400` — where the spec provides `404` so the client re-handshakes by itself. Every deploy broke every connected client until someone reconnected by hand. | There is no session to lose. |
| One entry per `initialize`, freed only by an explicit `DELETE` — so also by nothing, for any client that crashed or never sent one. | Nothing is retained. |
| Session affinity: one process, forever. | Any instance can answer any request. |

`GET /mcp` is `405` (no server-initiated stream to open, which the spec allows)
and `DELETE /mcp` is `204`, so a client still holding a session id from the old
version closes cleanly instead of hitting the SPA fallback.

JSON-RPC **batching is refused** (`-32600`): it is gone from the revision this
server advertises (`2025-06-18`), and honouring it would mean keeping the reply
queue this design exists to delete. A body that isn't JSON gets `-32700` rather
than Elysia's bare `400 Bad Request`, which names nothing a client can act on.

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

## The skill

`SKILL.md` teaches the discover → confirm → install workflow. It reaches a
client two ways, neither of which needs this repository:

- **As MCP `instructions`** — its body (frontmatter stripped) is handed to the
  client in the `initialize` result, by **both** transports. A client that
  installed nothing still gets the workflow.
- **As a file, from the deployed server** — `GET /mcp/skill.md` serves it as
  `text/markdown`, frontmatter included, since that is how a file-based skill is
  discovered:

  ```sh
  mkdir -p ~/.claude/skills/slidesk-addons
  curl -sSL https://slidesk.link/mcp/skill.md -o ~/.claude/skills/slidesk-addons/SKILL.md
  ```

`mcp/skill.ts` imports `SKILL.md` as text so it is embedded in the server
bundle — the release image ships `dist-server` only, so it cannot be read from
disk at runtime. Same reasoning as the SQL migrations.

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

## Tests

`tests/mcp-http.test.ts` drives the endpoint through `app.handle` — the
handshake, the protocol edges, the two failures the session `Map` used to cause,
and the tools against a stubbed hub. `tests/mcp-http-sdk.test.ts` is the only
one with a real listener, and the justification is that a compliance test which
never touches the wire proves nothing about the wire: it runs the **official**
SDK client, so the claim that a bare POST is enough is measured rather than
assumed.

## Safety

`install_addon` is only ever *executed* by the local stdio server, and even then
it spawns the CLI with an argument array (no shell) with `user`/`slug` validated
against `^[A-Za-z0-9_-]+$` — no command-injection surface. The exposed HTTP
server never executes anything: it only returns the command for the client.
