#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

/**
 * MCP server exposing the SliDesk.link addon hub to AI agents: search the hub,
 * inspect an addon, get the install command, and run it through the slidesk CLI.
 *
 * Config via env:
 *   SLIDESK_HOST  hub base URL      (default https://slidesk.link)
 *   SLIDESK_BIN   slidesk CLI path  (default "slidesk")
 */
const HOST = (process.env.SLIDESK_HOST ?? "https://slidesk.link").replace(
  /\/$/,
  "",
);
const BIN = process.env.SLIDESK_BIN ?? "slidesk";

const KINDS = ["plugin", "component", "theme", "template"] as const;
type Kind = (typeof KINDS)[number];
const PLURAL: Record<Kind, string> = {
  plugin: "plugins",
  component: "components",
  theme: "themes",
  template: "templates",
};

const NAME_RE = /^[A-Za-z0-9_-]+$/;

const kindSchema = z.enum(KINDS);
const nameSchema = z
  .string()
  .regex(NAME_RE, "must contain only letters, digits, '-' or '_'");

interface SearchAddon {
  slug: string;
  downloaded: number;
  description: string;
  user: string;
}
type SearchResponse = Record<string, SearchAddon[]>;

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const installCommand = (kind: Kind, user: string, slug: string) =>
  `${BIN} ${kind} install @${user}/${slug}`;

const addonUrl = (kind: Kind, user: string, slug: string) =>
  `${HOST}/a/${kind}/${user}/${slug}`;

/** POST /search/:term/:kinds — the hub's search API. */
async function searchHub(term: string, kinds: Kind[]): Promise<SearchResponse> {
  const q = term.trim() === "" ? "*" : encodeURIComponent(term.trim());
  const plurals = kinds.map((k) => PLURAL[k]).join(",");
  const res = await fetch(`${HOST}/search/${q}/${plurals}`, { method: "POST" });
  if (!res.ok) throw new Error(`Hub search failed (HTTP ${res.status})`);
  return (await res.json()) as SearchResponse;
}

function flatten(data: SearchResponse) {
  const out: {
    kind: Kind;
    user: string;
    slug: string;
    downloaded: number;
    description: string;
    command: string;
    url: string;
  }[] = [];
  for (const kind of KINDS) {
    for (const a of data[PLURAL[kind]] ?? []) {
      out.push({
        kind,
        user: a.user,
        slug: a.slug,
        downloaded: a.downloaded,
        description: stripHtml(a.description ?? ""),
        command: installCommand(kind, a.user, a.slug),
        url: addonUrl(kind, a.user, a.slug),
      });
    }
  }
  return out;
}

const text = (value: unknown) => ({
  content: [
    {
      type: "text" as const,
      text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
    },
  ],
});

const errorText = (message: string) => ({
  content: [{ type: "text" as const, text: message }],
  isError: true,
});

const server = new McpServer({
  name: "slidesk-addons",
  version: "0.1.0",
});

server.registerTool(
  "search_addons",
  {
    title: "Search SliDesk addons",
    description:
      "Search the SliDesk.link hub for plugins, components, themes and templates. " +
      "Returns matching addons with their install command and web URL. " +
      "Omit `query` (or use '*') to list everything of the requested kind(s).",
    inputSchema: {
      query: z
        .string()
        .optional()
        .describe(
          "Search term matched against slug/tags/description. '*' = all.",
        ),
      kind: kindSchema
        .optional()
        .describe("Restrict to one kind. Omit to search all four kinds."),
    },
  },
  async ({ query, kind }) => {
    try {
      const kinds = kind ? [kind] : [...KINDS];
      const results = flatten(await searchHub(query ?? "*", kinds));
      if (results.length === 0) return text("No addon found.");
      return text({ count: results.length, results });
    } catch (e) {
      return errorText(`search_addons failed: ${(e as Error).message}`);
    }
  },
);

server.registerTool(
  "get_addon",
  {
    title: "Get a SliDesk addon",
    description:
      "Fetch details for a single addon (description, download count, install " +
      "command, web URL) identified by kind, author slug and addon slug.",
    inputSchema: {
      kind: kindSchema,
      user: nameSchema.describe("Author slug, e.g. 'gouz'."),
      slug: nameSchema.describe("Addon slug, e.g. 'mermaid'."),
    },
  },
  async ({ kind, user, slug }) => {
    try {
      const results = flatten(await searchHub(slug, [kind]));
      const found = results.find((r) => r.user === user && r.slug === slug);
      if (!found)
        return errorText(`No ${kind} @${user}/${slug} found on the hub.`);
      return text(found);
    } catch (e) {
      return errorText(`get_addon failed: ${(e as Error).message}`);
    }
  },
);

server.registerTool(
  "get_install_command",
  {
    title: "Get the install command",
    description:
      "Return the slidesk CLI command that installs the given addon, WITHOUT " +
      "running it. Use this to show or explain the command before installing.",
    inputSchema: {
      kind: kindSchema,
      user: nameSchema,
      slug: nameSchema,
    },
  },
  async ({ kind, user, slug }) => text(installCommand(kind, user, slug)),
);

server.registerTool(
  "install_addon",
  {
    title: "Install a SliDesk addon",
    description:
      "Run the slidesk CLI to install an addon into a SliDesk project: " +
      "`slidesk <kind> install @user/slug`. Runs in `cwd` (default: current " +
      "directory). Requires the slidesk CLI to be installed. Returns the " +
      "command output and exit code.",
    inputSchema: {
      kind: kindSchema,
      user: nameSchema,
      slug: nameSchema,
      cwd: z
        .string()
        .optional()
        .describe("Directory of the SliDesk project (default: current dir)."),
    },
  },
  async ({ kind, user, slug, cwd }) => {
    // Args are passed as an array (no shell), and user/slug are regex-validated,
    // so there is no command-injection surface.
    const args = [kind, "install", `@${user}/${slug}`];
    try {
      const proc = Bun.spawn([BIN, ...args], {
        cwd: cwd ?? process.cwd(),
        stdout: "pipe",
        stderr: "pipe",
      });
      const [stdout, stderr, code] = await Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
        proc.exited,
      ]);
      const body = {
        command: `${BIN} ${args.join(" ")}`,
        exitCode: code,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      };
      return code === 0 ? text(body) : { ...text(body), isError: true };
    } catch (e) {
      return errorText(
        `Could not run the slidesk CLI ('${BIN}'). Is it installed and on PATH? ` +
          `${(e as Error).message}`,
      );
    }
  },
);

await server.connect(new StdioServerTransport());
