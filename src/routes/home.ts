import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";

const home = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET ?? "slidesk.link",
    }),
  )
  .get("/", async ({ jwt, cookie: { auth } }) => {
    const profile = await jwt.verify(auth.value as string);
    return new Response(
      Bun.file(
        `${process.cwd()}/dist-html/index${profile ? "-logged" : ""}.html`,
      ),
      {
        headers: { "Content-Type": "text/html" },
      },
    );
  })
  .get("/mentions", () => {
    return new Response(Bun.file(`${process.cwd()}/dist-html/mentions.html`), {
      headers: { "Content-Type": "text/html" },
    });
  });

export default home;
