import { Elysia } from "elysia";
import oauth from "../oauth";
import { jwt } from "@elysiajs/jwt";
import getUser from "../services/getUser";

const login = new Elysia({ prefix: "/login" })
  .use(oauth)
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET ?? "slidesk.link",
    }),
  )
  .get("/", async (ctx) => {
    const profiles = ctx.profiles();

    if (await ctx.authorized("github")) {
      const user = await fetch("https://api.github.com/user", {
        headers: await ctx.tokenHeaders("github"),
      });
      const dbUser = await getUser(await user.json());

      const value = await ctx.jwt.sign({
        id: dbUser?.id ?? "",
      });
      ctx.cookie.auth.set({
        value,
        httpOnly: true,
        maxAge: 7 * 86400,
        path: "/",
      });
      ctx.cookie.id.set({
        value: dbUser?.id ?? "",
        httpOnly: true,
        maxAge: 7 * 86400,
        path: "/",
      });

      return ctx.redirect("/profile");
    }

    return ctx.redirect(profiles.github.login);
  });

export default login;
