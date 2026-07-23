import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export const KINDS = ["plugin", "component", "theme", "template"] as const;
export type Kind = (typeof KINDS)[number];
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

export interface AddonToolsOptions {
  /** Hub base URL used for search (no trailing slash). */
  hostBase: string;
  /** Public base URL used to build addon web links. Defaults to hostBase. */
  publicBase?: string;
  /** slidesk CLI binary used when installMode is "execute". */
  bin?: string;
  /**
   * How install_addon behaves:
   * - "execute": run the slidesk CLI locally (stdio server on the user's machine)
   * - "command": return the command for the client to run (remote HTTP server)
   */
  installMode: "execute" | "command";
}

/**
 * Registers the SliDesk addon-hub tools on an McpServer. A remotely exposed
 * server uses installMode "command" so it never runs anything on the server —
 * it just tells the client which command to run locally.
 */
export function registerAddonTools(
  server: McpServer,
  opts: AddonToolsOptions,
): void {
  const hostBase = opts.hostBase.replace(/\/$/, "");
  const publicBase = (opts.publicBase ?? opts.hostBase).replace(/\/$/, "");
  const bin = opts.bin ?? "slidesk";

  const installCommand = (kind: Kind, user: string, slug: string) =>
    `slidesk ${kind} install @${user}/${slug}`;
  const addonUrl = (kind: Kind, user: string, slug: string) =>
    `${publicBase}/a/${kind}/${user}/${slug}`;

  async function searchHub(
    term: string,
    kinds: Kind[],
  ): Promise<SearchResponse> {
    const q = term.trim() === "" ? "*" : encodeURIComponent(term.trim());
    const plurals = kinds.map((k) => PLURAL[k]).join(",");
    const res = await fetch(`${hostBase}/search/${q}/${plurals}`, {
      method: "POST",
    });
    if (!res.ok) throw new Error(`Hub search failed (HTTP ${res.status})`);
    return (await res.json()) as SearchResponse;
  }

  function flatten(data: SearchResponse) {
    const out = [];
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
        "running it. Use this to show the command a user should run locally.",
      inputSchema: { kind: kindSchema, user: nameSchema, slug: nameSchema },
    },
    async ({ kind, user, slug }) => text(installCommand(kind, user, slug)),
  );

  if (opts.installMode === "command") {
    // Remote server: never execute anything — hand the client the command to
    // run in their own SliDesk project.
    server.registerTool(
      "install_addon",
      {
        title: "Install a SliDesk addon",
        description:
          "Returns the command to run locally to install the addon into your " +
          "SliDesk project. This server does not execute it — run the returned " +
          "command in your project directory.",
        inputSchema: { kind: kindSchema, user: nameSchema, slug: nameSchema },
      },
      async ({ kind, user, slug }) =>
        text(
          `Run this in your SliDesk project directory:\n\n${installCommand(kind, user, slug)}`,
        ),
    );
    return;
  }

  // Local (stdio) server: actually run the CLI.
  server.registerTool(
    "install_addon",
    {
      title: "Install a SliDesk addon",
      description:
        "Run the slidesk CLI to install an addon into a SliDesk project: " +
        "`slidesk <kind> install @user/slug`. Runs in `cwd` (default: current " +
        "directory). Requires the slidesk CLI. Returns the output and exit code.",
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
      // Args passed as an array (no shell) with regex-validated names — no
      // command-injection surface.
      const args = [kind, "install", `@${user}/${slug}`];
      try {
        const proc = Bun.spawn([bin, ...args], {
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
          command: `${bin} ${args.join(" ")}`,
          exitCode: code,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        };
        return code === 0 ? text(body) : { ...text(body), isError: true };
      } catch (e) {
        return errorText(
          `Could not run the slidesk CLI ('${bin}'). Is it installed and on PATH? ` +
            `${(e as Error).message}`,
        );
      }
    },
  );
}
