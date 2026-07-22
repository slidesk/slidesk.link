# SliDesk Addons — MCP server

An [MCP](https://modelcontextprotocol.io) server that lets AI agents browse the
SliDesk.link addon hub and install addons through the `slidesk` CLI.

## Tools

| Tool | Description |
| --- | --- |
| `search_addons(query?, kind?)` | Search the hub. Omit `query` (or use `*`) to list everything; omit `kind` to search plugins, components, themes and templates. Returns each addon's install command and web URL. |
| `get_addon(kind, user, slug)` | Details for one addon (description, downloads, command, URL). |
| `get_install_command(kind, user, slug)` | Return the install command **without** running it. |
| `install_addon(kind, user, slug, cwd?)` | Run `slidesk <kind> install @user/slug` in `cwd` (default: current directory). Requires the `slidesk` CLI. |

## Run

```sh
bun run mcp        # or: bun mcp/server.ts
```

The server speaks MCP over **stdio**.

### Environment

| Var | Default | Purpose |
| --- | --- | --- |
| `SLIDESK_HOST` | `https://slidesk.link` | Hub base URL used for search. |
| `SLIDESK_BIN` | `slidesk` | Path to the `slidesk` CLI used by `install_addon`. |

## Register with a client

**Claude Code**

```sh
claude mcp add slidesk-addons -- bun /absolute/path/to/slidesk.link/mcp/server.ts
```

**`.mcp.json` / Claude Desktop**

```json
{
  "mcpServers": {
    "slidesk-addons": {
      "command": "bun",
      "args": ["/absolute/path/to/slidesk.link/mcp/server.ts"],
      "env": { "SLIDESK_HOST": "https://slidesk.link" }
    }
  }
}
```

## Safety

`install_addon` spawns the CLI with an argument array (no shell), and `user`/`slug`
are validated against `^[A-Za-z0-9_-]+$`, so there is no command-injection surface.
