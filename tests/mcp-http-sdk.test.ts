import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { mcpRoutes } from "../mcp/elysia";

/**
 * The only test here that uses a real socket, and the justification is that a
 * compliance test which never touches the wire proves nothing about the wire:
 * the claim this endpoint rests on is that the OFFICIAL client completes a
 * session against a bare POST with no session identifier and no SSE stream.
 * Nothing of `mcp/` is on the client side of this test.
 */
let listener: { stop: () => void; server: { port: number } | null };
let client: Client;

beforeAll(async () => {
  listener = mcpRoutes({
    hostBase: "http://hub.test",
    publicBase: "https://slidesk.link",
  }).listen(0) as unknown as typeof listener;

  client = new Client({ name: "sdk-compat", version: "0" });
  await client.connect(
    new StreamableHTTPClientTransport(
      new URL(`http://localhost:${listener.server?.port}/mcp`),
    ),
  );
});

afterAll(async () => {
  await client.close();
  listener.stop();
});

describe("the official SDK client", () => {
  test("connects, and is handed the skill as instructions", () => {
    expect(client.getServerVersion()).toEqual({
      name: "slidesk-addons",
      version: "0.1.0",
    });
    expect(client.getInstructions()).toContain("search_addons");
  });

  test("lists the four tools", async () => {
    const { tools } = await client.listTools();

    expect(tools.map((t) => t.name).sort()).toEqual([
      "get_addon",
      "get_install_command",
      "install_addon",
      "search_addons",
    ]);
  });

  test("calls a tool, twice on the same client, with no session between them", async () => {
    for (const [slug, expected] of [
      ["mermaid", "slidesk plugin install @gouz/mermaid"],
      ["highlight", "slidesk plugin install @gouz/highlight"],
    ]) {
      const result = await client.callTool({
        name: "get_install_command",
        arguments: { kind: "plugin", user: "gouz", slug },
      });

      expect((result.content as { text: string }[])[0].text).toBe(expected);
    }
  });
});
