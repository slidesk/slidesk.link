import { Resvg } from "@resvg/resvg-js";
import { Elysia } from "elysia";
import findForOg from "../database/addon/findForOg";
import { ogSvg } from "../services/og-image";

const authorizedKinds = ["plugin", "component", "theme", "template"];

const ogPage = (kind: string, userSlug: string, slug: string, description: string | null, ogImage: string, redirectUrl: string) => {
  const typeLabel = kind.charAt(0).toUpperCase() + kind.slice(1);
  const title = `${slug} - ${typeLabel} by @${userSlug} | SliDesk.link`;
  const desc = description
    ? description.replace(/<[^>]*>/g, "").slice(0, 200)
    : `${typeLabel} addon by @${userSlug}`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${title}</title>
  <meta property="og:title" content="${title}"/>
  <meta property="og:description" content="${desc}"/>
  <meta property="og:image" content="${ogImage}"/>
  <meta property="og:url" content="${redirectUrl}"/>
  <meta property="og:site_name" content="SliDesk.link"/>
  <meta name="description" content="${desc}"/>
  <link rel="canonical" href="${redirectUrl}"/>
  <meta http-equiv="refresh" content="3;url=${redirectUrl}"/>
  <style>
    body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f0f1a; color: #fff; }
    a { color: #e94560; }
  </style>
</head>
<body>
  <p>Redirecting to <a href="${redirectUrl}">${redirectUrl}</a></p>
</body>
</html>`;
};

const handleOgLookup = async (kind: string, user: string, slug: string, ogImagePrefix: string, redirectUrl: string) => {
  const data = await findForOg(kind, user, slug);
  if (!data) return null;

  const ogImage = `https://slidesk.link/${ogImagePrefix}/${kind}/${data.userSlug}/${data.slug}/og`;

  return ogPage(kind, data.userSlug, data.slug, data.description, ogImage, redirectUrl);
};

const addonPage = new Elysia({ prefix: "/a" })
  .get("/:kind/:user/:slug", async ({ params: { kind, user, slug }, set }) => {
    if (!authorizedKinds.includes(kind)) {
      set.status = 404;
      return "Not found";
    }

    const redirectUrl = `https://slidesk.link/${kind}s/#${user}__${slug}`;
    const html = await handleOgLookup(kind, user, slug, "a", redirectUrl);
    if (!html) {
      set.status = 404;
      return "Not found";
    }

    set.headers = { "Content-Type": "text/html" };
    return html;
  })
  .get(
    "/:kind/:user/:slug/og",
    async ({ params: { kind, user, slug }, set }) => {
      if (!authorizedKinds.includes(kind)) {
        set.status = 404;
        return "Not found";
      }

      const data = await findForOg(kind, user, slug);
      if (!data) {
        set.status = 404;
        return "Not found";
      }

      const svg = ogSvg(kind, data.slug, data.userSlug, data.avatarUrl);
      const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
      const png = resvg.render().asPng();

      set.headers = {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      };
      return new Response(png);
    },
  );

export default addonPage;
