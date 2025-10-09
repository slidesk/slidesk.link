import { jwt } from "@elysiajs/jwt";
import Elysia from "elysia";

const exit = new Elysia({ prefix: "/exit" })
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET ?? "slidesk.link",
    }),
  )
  .get("/", async ({ cookie }) => {
    cookie.auth.remove();
    return new Response(null, {
      status: 301,
      headers: {
        Location: "/",
      },
    });
  });

export default exit;
