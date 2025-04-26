import Elysia from "elysia";
import { jwt } from "@elysiajs/jwt";
import oauth from "../oauth";

const exit = new Elysia({ prefix: "/exit" })
  .use(oauth)
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET ?? "slidesk.link",
    }),
  )
  .get("/", async (ctx) => {
    ctx.cookie.auth.set({});
    return ctx.redirect(ctx.profiles().github.logout);
  });

export default exit;
