import Elysia from "elysia";
import { APP_DIR, isValidUuid, safeJoin } from "../services/paths";

const hosted = new Elysia({ prefix: "/s" })
  .get("/:uuid", async ({ params: { uuid } }) => {
    if (!isValidUuid(uuid)) return new Response("", { status: 404 });
    const fichier = Bun.file(
      `${APP_DIR}/presentations/${uuid}/__SLIDESKLINK__/index.html`,
    );
    if (await fichier.exists())
      return new Response(await fichier.text(), {
        headers: { "Content-Type": "text/html" },
      });
    return new Response("", { status: 404 });
  })
  .get("/:uuid/*", async ({ params }) => {
    const { uuid } = params;
    const file = params["*"];
    if (!isValidUuid(uuid)) return new Response("", { status: 404 });
    const base = `${APP_DIR}/presentations/${uuid}/__SLIDESKLINK__`;
    const path = safeJoin(base, file);
    if (!path) return new Response("", { status: 403 });
    const fichier = Bun.file(path);
    if (await fichier.exists())
      return new Response(await fichier.bytes(), {
        headers: { "Content-Type": fichier.type },
      });
    return new Response("", { status: 404 });
  });

export default hosted;
