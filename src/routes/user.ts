import { Elysia } from "elysia";
import checkSlug from "../database/user/checkSlug";

const HOST = Bun.env.HOST ?? "https://slidesk.link";

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Serves the SPA shell for a speaker page, injecting per-user <head> meta so
// crawlers and social unfurlers get correct title/description/OG. The body is
// rendered client-side from GET /api/user/:slug.
const user = new Elysia({ prefix: "/u" }).get(
  "/:user",
  async ({ params: { user }, set }) => {
    const u = await checkSlug(user);
    if (!u) {
      set.status = 404;
      return "User not found";
    }

    const shell = await Bun.file(
      `${process.cwd()}/dist-client/index.html`,
    ).text();

    const title = `${u.name ?? u.slug} | SliDesk.link`;
    const desc = (u.bio ?? `Talks and addons by @${u.slug}`)
      .replace(/<[^>]*>/g, "")
      .slice(0, 200);
    const image = u.avatarUrl ?? `${HOST}/public/slidesk-180x180.png`;
    const url = `${HOST}/u/${u.slug}`;

    const meta = [
      `<meta name="description" content="${esc(desc)}" />`,
      `<meta property="og:type" content="profile" />`,
      `<meta property="og:title" content="${esc(title)}" />`,
      `<meta property="og:description" content="${esc(desc)}" />`,
      `<meta property="og:image" content="${esc(image)}" />`,
      `<meta property="og:url" content="${esc(url)}" />`,
      `<meta property="og:site_name" content="SliDesk.link" />`,
      `<link rel="canonical" href="${esc(url)}" />`,
    ].join("\n    ");

    const html = shell
      .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
      .replace("</head>", `    ${meta}\n  </head>`);

    set.headers["Content-Type"] = "text/html; charset=utf-8";
    return html;
  },
);

export default user;
