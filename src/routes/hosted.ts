import Elysia from "elysia";

const hosted = new Elysia({ prefix: "/s" })
  .get("/:uuid", async ({ params: { uuid } }) => {
    return new Response(
      await Bun.file(
        `${process.cwd()}/presentations/${uuid}/__SLIDESKLINK__/index.html`,
      ).text(),
      { headers: { "Content-Type": "text/html" } },
    );
  })
  .get("/:uuid/*", async ({ params }) => {
    const { uuid } = params;
    const file = params["*"];
    if (file.startsWith(".")) return new Response("", { status: 403 });
    const fichier = Bun.file(
      `${process.cwd()}/presentations/${uuid}/__SLIDESKLINK__/${file}`,
    );
    return new Response(await fichier.text(), {
      headers: { "Content-Type": fichier.type },
    });
  })
  .ws("/:uuid/ws", {
    message(ws, message) {
      ws.send(message);
    },
  });

export default hosted;
