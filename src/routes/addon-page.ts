import { Elysia } from "elysia";
import findForOg from "../database/addon/findForOg";
import { ogSvg } from "../services/og-image";

const authorizedKinds = ["plugin", "component", "theme", "template"];

const addonPage = new Elysia({ prefix: "/a" })
  .get("/:kind/:user/:slug", async ({ params: { kind, user, slug }, set }) => {
    if (!authorizedKinds.includes(kind)) {
      set.status = 404;
      return "Not found";
    }

    const data = await findForOg(kind, user, slug);
    if (!data) {
      set.status = 404;
      return "Not found";
    }

    const typeLabel = kind.charAt(0).toUpperCase() + kind.slice(1);
    const title = `${data.slug} - ${typeLabel} by @${data.userSlug} | SliDesk.link`;
    const description = data.description
      ? data.description.replace(/<[^>]*>/g, "").slice(0, 200)
      : `${typeLabel} addon by @${data.userSlug}`;
    const ogImage = `https://slidesk.link/a/${kind}/${data.userSlug}/${data.slug}/og`;
    const canonical = `https://slidesk.link/u/${data.userSlug}/`;

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${title}</title>
  <meta property="og:title" content="${title}"/>
  <meta property="og:description" content="${description}"/>
  <meta property="og:image" content="${ogImage}"/>
  <meta property="og:url" content="${canonical}"/>
  <meta property="og:site_name" content="SliDesk.link"/>
  <meta name="description" content="${description}"/>
  <link rel="canonical" href="${canonical}"/>
  <meta http-equiv="refresh" content="0;url=${canonical}"/>
  <style>
    body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f0f1a; color: #fff; }
    a { color: #e94560; }
  </style>
</head>
<body>
  <p>Redirecting to <a href="${canonical}">${canonical}</a></p>
</body>
</html>`;

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

      set.headers = {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400",
      };
      return svg;
    },
  );

export default addonPage;
