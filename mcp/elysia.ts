import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import {
  isInitializeRequest,
  type JSONRPCMessage,
} from "@modelcontextprotocol/sdk/types.js";
import { Elysia } from "elysia";
import { registerAddonTools } from "./tools";

/**
 * A minimal MCP transport that bridges a single Elysia HTTP request/response to
 * the MCP server. Our tools are request/response only (no server-initiated
 * notifications or streaming), so a plain JSON reply per POST is sufficient —
 * no SSE needed. Sessions are kept in memory, keyed by `mcp-session-id`.
 */
class ElysiaBridge implements Transport {
  onmessage?: (message: JSONRPCMessage) => void;
  onclose?: () => void;
  onerror?: (error: Error) => void;
  sessionId?: string;
  private waiters: ((message: JSONRPCMessage) => void)[] = [];

  async start() {}
  async close() {
    this.onclose?.();
  }
  async send(message: JSONRPCMessage) {
    this.waiters.shift()?.(message);
  }

  /** Feed a client request and resolve with the server's single response. */
  request(message: JSONRPCMessage): Promise<JSONRPCMessage> {
    return new Promise((resolve) => {
      this.waiters.push(resolve);
      this.onmessage?.(message);
    });
  }
  /** Feed a notification (no response expected). */
  notify(message: JSONRPCMessage) {
    this.onmessage?.(message);
  }
}

const isRequest = (m: unknown): m is JSONRPCMessage & { id: unknown } =>
  typeof m === "object" &&
  m !== null &&
  "method" in m &&
  "id" in m &&
  (m as { id: unknown }).id !== undefined &&
  (m as { id: unknown }).id !== null;

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
 */
export const mcpRoutes = (opts: McpRoutesOptions) => {
  const sessions = new Map<string, ElysiaBridge>();

  const createSession = async () => {
    const transport = new ElysiaBridge();
    transport.sessionId = randomUUID();
    const server = new McpServer({ name: "slidesk-addons", version: "0.1.0" });
    registerAddonTools(server, {
      hostBase: opts.hostBase,
      publicBase: opts.publicBase,
      installMode: "command",
    });
    await server.connect(transport);
    sessions.set(transport.sessionId, transport);
    return transport;
  };

  return new Elysia()
    .post("/mcp", async ({ body, headers, set }) => {
      const sid = headers["mcp-session-id"];
      let transport = sid ? sessions.get(sid) : undefined;
      const messages = (
        Array.isArray(body) ? body : [body]
      ) as JSONRPCMessage[];

      if (!transport) {
        if (!messages.some((m) => isInitializeRequest(m))) {
          set.status = 400;
          return {
            jsonrpc: "2.0",
            id: null,
            error: {
              code: -32000,
              message: "No valid session; send an initialize request first.",
            },
          };
        }
        transport = await createSession();
        set.headers["mcp-session-id"] = transport.sessionId as string;
      }

      const responses: JSONRPCMessage[] = [];
      for (const m of messages) {
        if (isRequest(m)) responses.push(await transport.request(m));
        else transport.notify(m);
      }

      if (responses.length === 0) {
        set.status = 202;
        return "";
      }
      set.headers["Content-Type"] = "application/json";
      return Array.isArray(body) ? responses : responses[0];
    })
    .delete("/mcp", ({ headers, set }) => {
      const sid = headers["mcp-session-id"];
      if (sid && sessions.has(sid)) {
        sessions.get(sid)?.close();
        sessions.delete(sid);
      }
      set.status = 204;
      return "";
    })
    .get("/mcp", ({ set }) => {
      set.status = 405;
      return "Method Not Allowed";
    });
};
