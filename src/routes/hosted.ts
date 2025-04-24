import Elysia from "elysia";

const hosted = new Elysia({ prefix: "/s" })
  .get("/:uuid", async ({ params: { uuid } }) => {
    const fichier = Bun.file(
      `${process.cwd()}/presentations/${uuid}/__SLIDESKLINK__/index.html`,
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
    if (file.startsWith(".")) return new Response("", { status: 403 });
    const fichier = Bun.file(
      `${process.cwd()}/presentations/${uuid}/__SLIDESKLINK__/${file}`,
    );
    if (await fichier.exists())
      return new Response(await fichier.text(), {
        headers: { "Content-Type": fichier.type },
      });
    return new Response("", { status: 404 });
  });

export default hosted;
