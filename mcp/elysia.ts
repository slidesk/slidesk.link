import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import { Elysia } from "elysia";
import { SKILL_INSTRUCTIONS, SKILL_MARKDOWN } from "./skill";
import { registerAddonTools } from "./tools";

/**
 * A one-shot MCP transport: it carries a single HTTP request to a freshly built
 * server and resolves with that server's single reply.
 *
 * ⚠️ STATELESS ON PURPOSE. The previous version kept a `Map` of sessions keyed
 * by `mcp-session-id`, and that cost three things nobody was paying for: an
 * entry per `initialize` that only an explicit `DELETE` ever freed, session
 * affinity (so one process, forever), and — the one clients actually felt — a
 * `400` for a session this process no longer knows, where the specification
 * provides `404` precisely so the client can re-handshake by itself. Every
 * deploy therefore broke every connected client until someone reconnected by
 * hand. Our tools hold no per-session state, so there was nothing in those
 * sessions to lose; the official `StreamableHTTPClientTransport` completes
 * `initialize`, `tools/list` and `tools/call` against an endpoint that answers
 * one POST with one JSON body and no session identifier at all.
 */
class OneShot implements Transport {
  onmessage?: (message: JSONRPCMessage) => void;
  onclose?: () => void;
  onerror?: (error: Error) => void;
  private resolve?: (message: JSONRPCMessage) => void;

  async start() {}
  async close() {
    this.onclose?.();
  }
  async send(message: JSONRPCMessage) {
    this.resolve?.(message);
    this.resolve = undefined;
  }

  /** Feed a client request and resolve with the server's single response. */
  request(message: JSONRPCMessage): Promise<JSONRPCMessage> {
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.onmessage?.(message);
    });
  }
  /** Feed a notification (no response expected). */
  notify(message: JSONRPCMessage) {
    this.onmessage?.(message);
  }
}

/** JSON-RPC's answer when the bytes are not JSON. `id: null` is what it provides for it. */
const PARSE_ERROR = {
  jsonrpc: "2.0" as const,
  id: null,
  error: { code: -32700, message: "Parse error" },
};

/** JSON-RPC's answer when the JSON is not a single message we can read. */
const INVALID_REQUEST = {
  jsonrpc: "2.0" as const,
  id: null,
  error: { code: -32600, message: "Invalid Request" },
};

/**
 * Whether a parsed body is one message this endpoint can answer.
 *
 * ⚠️ An array is refused rather than looped over: JSON-RPC batching is gone
 * from the revision this server advertises (`2025-06-18`), and honouring it
 * would mean keeping a queue of pending replies — the one piece of state this
 * rewrite exists to delete.
 */
const isMessage = (
  value: unknown,
): value is JSONRPCMessage & { id?: unknown } =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  typeof (value as { method?: unknown }).method === "string";

/** A message with an id expects a reply; one without is a notification. */
const expectsReply = (message: { id?: unknown }) =>
  message.id !== undefined && message.id !== null;

export interface McpRoutesOptions {
  /** Hub base URL used for search (usually the app itself). */
  hostBase: string;
  /** Public base URL used to build addon web links. */
  publicBase?: string;
}

/**
 * Elysia plugin exposing the addon-hub MCP server over Streamable HTTP at
 * `/mcp` — on the app's own port, so it's reachable at e.g.
 * https://slidesk.link/mcp with no extra port or proxy rule. Discovery-only:
 * install_addon returns the command for the client to run locally.
 *
 * It also serves the skill at `/mcp/skill.md`, so the guidance is fetchable
 * with one `curl` instead of being copied out of this repository.
 */
export const mcpRoutes = (opts: McpRoutesOptions) => {
  /**
   * ⚠️ Built PER REQUEST. Registering four tools costs a few microseconds, and
   * one shared instance would need a reply queue to stay correct under two
   * concurrent calls — that queue is exactly what the session `Map` was.
   *
   * `instructions` reaches the client in the `initialize` result: it is how a
   * client that installed nothing still learns the workflow the skill teaches.
   */
  const buildServer = async (transport: Transport) => {
    const server = new McpServer(
      { name: "slidesk-addons", version: "0.1.0" },
      { instructions: SKILL_INSTRUCTIONS },
    );
    registerAddonTools(server, {
      hostBase: opts.hostBase,
      publicBase: opts.publicBase,
      installMode: "command",
    });
    await server.connect(transport);
    return server;
  };

  /**
   * Answer one MCP message.
   *
   * `parse: "none"` and a hand parse: asked to parse the body itself, Elysia
   * answers a bare `400 Bad Request` — a string no JSON-RPC client can read,
   * naming neither the problem nor its position.
   */
  const answer = async ({ request }: { request: Request }) => {
    let message: unknown;
    try {
      message = JSON.parse(await request.text());
    } catch {
      return PARSE_ERROR;
    }
    if (!isMessage(message)) return INVALID_REQUEST;

    const transport = new OneShot();
    const server = await buildServer(transport);
    try {
      // ⚠️ A notification MUST NOT be answered — a strict client drops the
      // connection over a body here. 202 with no body is "accepted, nothing
      // to say".
      if (!expectsReply(message)) {
        transport.notify(message);
        return new Response(null, { status: 202 });
      }
      return await transport.request(message);
    } finally {
      await server.close();
    }
  };

  return (
    new Elysia()
      .post("/mcp", answer, { parse: "none" })
      // Served as a file to save, not a page to render.
      .get(
        "/mcp/skill.md",
        () =>
          new Response(SKILL_MARKDOWN, {
            headers: { "content-type": "text/markdown; charset=utf-8" },
          }),
      )
      .get("/mcp", ({ set }) => {
        // No server-initiated stream to open, which the specification allows.
        set.status = 405;
        return "Method Not Allowed";
      })
      .delete("/mcp", () => new Response(null, { status: 204 }))
  );
};
