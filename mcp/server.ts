#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAddonTools } from "./tools";

/**
 * Local (stdio) MCP server for the SliDesk addon hub. Runs on the user's
 * machine, so it also exposes install_addon (which installs into the user's
 * SliDesk project via the slidesk CLI).
 *
 * Env: SLIDESK_HOST (default https://slidesk.link), SLIDESK_BIN (default slidesk).
 */
const server = new McpServer({ name: "slidesk-addons", version: "0.1.0" });

registerAddonTools(server, {
  hostBase: process.env.SLIDESK_HOST ?? "https://slidesk.link",
  bin: process.env.SLIDESK_BIN ?? "slidesk",
  installMode: "execute",
});

await server.connect(new StdioServerTransport());
