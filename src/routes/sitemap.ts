import Elysia from "elysia";
import {
  addonRepositories,
  authorizedKinds,
} from "../database/addon/repository";
import getAllUsers from "../database/user/getAll";

const HOST = "https://slidesk.link";

const sitemap = new Elysia()
  .get("/sitemap.xml", async () => {
    const users = await getAllUsers();

    // All addons across every kind, linked via their crawler-facing /a page
    // (server-rendered with OG meta; the SPA listing uses #fragments which
    // sitemaps/crawlers ignore).
    const addonsByKind = await Promise.all(
      authorizedKinds.map(async (kind) => ({
        kind,
        addons: await addonRepositories[kind].search(""),
      })),
    );
    const addonUrls = addonsByKind
      .flatMap(({ kind, addons }) =>
        addons.map(
          (a) => `<url>
      <loc>${HOST}/a/${kind}/${a.user.slug}/${a.slug}</loc>
    </url>`,
        ),
      )
      .join("");

    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>${HOST}/</loc>
    </url>
    <url>
      <loc>${HOST}/mentions</loc>
    </url>
    <url>
      <loc>${HOST}/users</loc>
    </url>
    ${[...users]
      .map(
        (u) => `<url>
      <loc>${HOST}/u/${u.slug}</loc>
      <lastmod>${u.updatedAt.toISOString()}</lastmod>
    </url>`,
      )
      .join("")}
    ${addonUrls}
  </urlset>`,
      { headers: { "Content-Type": "text/xml" } },
    );
  })
  .get("/robots.txt", () => "Sitemap: https://slidesk.link/sitemap.xml");

export default sitemap;
