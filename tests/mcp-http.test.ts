import { afterEach, beforeAll, describe, expect, test } from "bun:test";
import { mcpRoutes } from "../mcp/elysia";
import { SKILL_MARKDOWN } from "../mcp/skill";

let app: { handle: (request: Request) => Promise<Response> };

const HUB = "http://hub.test";
const PUBLIC = "https://slidesk.link";

/** Post one JSON-RPC message, optionally with headers a stale client would send. */
const post = (body: unknown, headers: Record<string, string> = {}) =>
  app.handle(
    new Request("http://localhost/mcp", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

const rpc = async (body: unknown, headers?: Record<string, string>) => {
  const response = await post(body, headers);
  return { status: response.status, json: await response.json() };
};

const initialize = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "test", version: "0" },
  },
};

const realFetch = globalThis.fetch;
/** Stand in for the hub's own search endpoint, and record what was asked of it. */
const stubHub = (payload: unknown) => {
  const calls: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    calls.push(String(input));
    return Response.json(payload);
  }) as typeof fetch;
  return calls;
};

beforeAll(() => {
  app = mcpRoutes({ hostBase: HUB, publicBase: PUBLIC });
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("POST /mcp — the handshake", () => {
  test("introduces the server and carries the skill as instructions", async () => {
    const { status, json } = await rpc(initialize);

    expect(status).toBe(200);
    expect(json.result.serverInfo).toEqual({
      name: "slidesk-addons",
      version: "0.1.0",
    });
    expect(json.result.protocolVersion).toBe("2025-06-18");
    expect(json.result.capabilities.tools).toBeDefined();
    // A client that installed nothing still learns the workflow.
    expect(json.result.instructions).toContain("search_addons");
    expect(json.result.instructions).not.toContain("---");
  });

  test("answers a notification with 202 and no body", async () => {
    const response = await post({
      jsonrpc: "2.0",
      method: "notifications/initialized",
    });

    expect(response.status).toBe(202);
    expect(await response.text()).toBe("");
  });
});

describe("POST /mcp — no session to lose", () => {
  test("lists the tools as the very first message, with no initialize", async () => {
    // The regression this endpoint was rewritten for: a session-keyed server
    // answered -32000 "send an initialize request first".
    const { status, json } = await rpc({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
    });

    expect(status).toBe(200);
    expect(
      json.result.tools.map((t: { name: string }) => t.name).sort(),
    ).toEqual([
      "get_addon",
      "get_install_command",
      "install_addon",
      "search_addons",
    ]);
  });

  test("ignores a session id it has never issued instead of refusing it", async () => {
    // What every deploy used to do to a connected client, answered 400 where
    // the specification provides 404 so the client re-handshakes by itself.
    const { status, json } = await rpc(
      { jsonrpc: "2.0", id: 3, method: "tools/list" },
      { "mcp-session-id": "00000000-0000-0000-0000-000000000000" },
    );

    expect(status).toBe(200);
    expect(json.result.tools).toHaveLength(4);
  });

  test("issues no session id at all", async () => {
    const response = await post(initialize);

    expect(response.headers.get("mcp-session-id")).toBeNull();
  });

  test("keeps two concurrent calls' replies apart", async () => {
    stubHub({ plugins: [] });

    const replies = await Promise.all([
      rpc({ jsonrpc: "2.0", id: "a", method: "tools/list" }),
      rpc({
        jsonrpc: "2.0",
        id: "b",
        method: "tools/call",
        params: {
          name: "get_install_command",
          arguments: { kind: "theme", user: "gouz", slug: "dark" },
        },
      }),
    ]);

    expect(replies.map((r) => r.json.id)).toEqual(["a", "b"]);
    expect(replies[0].json.result.tools).toBeDefined();
    expect(replies[1].json.result.content[0].text).toBe(
      "slidesk theme install @gouz/dark",
    );
  });
});

describe("POST /mcp — a body a client can read", () => {
  test("refuses bytes that are not JSON with -32700, not a bare 400", async () => {
    const { status, json } = await rpc("{not json");

    expect(status).toBe(200);
    expect(json).toEqual({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: "Parse error" },
    });
  });

  test("refuses JSON that is not a message with -32600", async () => {
    for (const body of [{ jsonrpc: "2.0", id: 1 }, [initialize], "42"]) {
      const { json } = await rpc(body);
      expect(json.error.code).toBe(-32600);
    }
  });
});

describe("POST /mcp — the tools", () => {
  test("searches the hub and hands back a command and a public URL", async () => {
    const calls = stubHub({
      plugins: [
        {
          slug: "mermaid",
          downloaded: 42,
          description: "<p>Mermaid   diagrams</p>",
          user: "gouz",
        },
      ],
    });

    const { json } = await rpc({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "search_addons",
        arguments: { query: "mermaid", kind: "plugin" },
      },
    });

    expect(calls).toEqual([`${HUB}/search/mermaid/plugins`]);
    const payload = JSON.parse(json.result.content[0].text);
    expect(payload).toEqual({
      count: 1,
      results: [
        {
          kind: "plugin",
          user: "gouz",
          slug: "mermaid",
          downloaded: 42,
          description: "Mermaid diagrams",
          command: "slidesk plugin install @gouz/mermaid",
          url: `${PUBLIC}/a/plugin/gouz/mermaid`,
        },
      ],
    });
  });

  test("never executes anything: install_addon returns the command", async () => {
    const { json } = await rpc({
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "install_addon",
        arguments: { kind: "plugin", user: "gouz", slug: "mermaid" },
      },
    });

    expect(json.result.content[0].text).toContain(
      "slidesk plugin install @gouz/mermaid",
    );
    // The remote surface has no `cwd`: there is no directory to run in.
    const { json: listed } = await rpc({
      jsonrpc: "2.0",
      id: 6,
      method: "tools/list",
    });
    const install = listed.result.tools.find(
      (t: { name: string }) => t.name === "install_addon",
    );
    expect(Object.keys(install.inputSchema.properties).sort()).toEqual([
      "kind",
      "slug",
      "user",
    ]);
  });
});

describe("the other methods on /mcp", () => {
  test("GET is 405: there is no stream to open", async () => {
    const response = await app.handle(new Request("http://localhost/mcp"));

    expect(response.status).toBe(405);
  });

  test("DELETE is 204, so a client holding an old session closes cleanly", async () => {
    const response = await app.handle(
      new Request("http://localhost/mcp", {
        method: "DELETE",
        headers: { "mcp-session-id": "whatever" },
      }),
    );

    expect(response.status).toBe(204);
  });
});

describe("GET /mcp/skill.md", () => {
  test("serves the skill byte-for-byte, as markdown", async () => {
    const response = await app.handle(
      new Request("http://localhost/mcp/skill.md"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/markdown");
    const body = await response.text();
    expect(body).toBe(SKILL_MARKDOWN);
    // Frontmatter included: a file-based skill is discovered by it.
    expect(body).toStartWith("---\nname: slidesk-addons");
  });
});
