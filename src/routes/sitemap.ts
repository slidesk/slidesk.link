import Elysia from "elysia";
import { db } from "../db";

const sitemap = new Elysia()
  .get("/sitemap.xml", async () => {
    const users = await db.user.findMany();

    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://slidesk.link/</loc>
    </url>
    <url>
      <loc>https://slidesk.link/mentions.html</loc>
    </url>
    ${[...users]
      .map(
        (u) => `<url>
      <loc>https://slidesk.link/u/${u.slug}</loc>
      <lastmod>${u.updatedAt.toISOString()}</lastmod>
    </url>`,
      )
      .join("")}
  </urlset>`,
      { headers: { "Content-Type": "text/xml" } },
    );
  })
  .get("/robots.txt", () => "Sitemap: https://slidesk.link/sitemap.xml");

export default sitemap;
