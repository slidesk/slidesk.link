---
name: slidesk-addons
description: >-
  Find and install SliDesk addons — plugins, components, themes and templates —
  from the SliDesk.link hub. Use when a user wants to add a capability to a
  SliDesk presentation (e.g. Mermaid diagrams, syntax highlighting, a theme, a
  slide template), asks "is there a SliDesk plugin/theme for X", or wants to
  browse/install community addons. Requires the `slidesk-addons` MCP server.
---

# SliDesk addons

SliDesk presentations are extended with four kinds of addon from the
[SliDesk.link](https://slidesk.link) hub:

- **plugin** — adds runtime behavior (animations, Mermaid, highlight.js, …)
- **component** — reusable slide building blocks
- **theme** — visual styling
- **template** — ready-made slide layouts

This skill uses the `slidesk-addons` MCP server. Its tools:
`search_addons`, `get_addon`, `get_install_command`, `install_addon`.

## Workflow

1. **Discover.** Call `search_addons({ query, kind? })`.
   - `query` is matched against slug/tags/description; use `*` (or omit) to list
     everything of a kind.
   - Pass `kind` (`plugin` | `component` | `theme` | `template`) to narrow, or
     omit to search all four.
   - Each result includes `slug`, author (`user`), `downloaded`, a short
     `description`, the ready-to-run `command`, and the `url`.

2. **Confirm.** If several match, show the user the candidates (name, author,
   download count, one-line description) and let them choose. Use
   `get_addon({ kind, user, slug })` for more detail on one.

3. **Install.** Call `install_addon({ kind, user, slug })`.
   - On the **local (stdio)** server it runs `slidesk <kind> install @user/slug`
     in the project directory (pass `cwd` if needed) and returns the output.
   - On the **remote (HTTP)** server it returns the exact command for the user
     to run themselves — relay it and tell them to run it in their SliDesk
     project. `get_install_command` does the same on demand.

## Guidance

- Addons install into the user's **local SliDesk project**, so a remotely hosted
  MCP can only hand back the command — it cannot install for the user.
- Prefer higher `downloaded` counts when suggesting between similar addons, but
  surface the trade-offs rather than deciding silently.
- The install command format is always `slidesk <kind> install @<user>/<slug>`.
- If a search returns nothing, broaden the query or drop the `kind` filter
  before concluding the addon does not exist.

## Example

> "Can I show Mermaid diagrams in my SliDesk slides?"

1. `search_addons({ query: "mermaid", kind: "plugin" })`
2. Found `@gouz/mermaid` (plugin). Confirm with the user.
3. `install_addon({ kind: "plugin", user: "gouz", slug: "mermaid" })`
   → runs (local) or returns `slidesk plugin install @gouz/mermaid` (remote).
