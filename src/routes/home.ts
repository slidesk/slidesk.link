import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

const home = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET ?? "slidesk.link",
    }),
  )
  .get("/", async ({ jwt, cookie: { auth } }) => {
    const profile = await jwt.verify(auth.value);
    return new Response(
      Bun.file(`${process.cwd()}/dist/index${profile ? "-logged" : ""}.html`),
      {
        headers: { "Content-Type": "text/html" },
      },
    );
  })
  .get("/mentions", () => {
    return new Response(Bun.file(`${process.cwd()}/dist/mentions.html`), {
      headers: { "Content-Type": "text/html" },
    });
  });

export default home;
