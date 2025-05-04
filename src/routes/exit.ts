import Elysia from "elysia";
import { jwt } from "@elysiajs/jwt";

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
