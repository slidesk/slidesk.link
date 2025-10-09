import { jwt } from "@elysiajs/jwt";
import Elysia from "elysia";
import getToken from "../database/user/getToken";

const auth = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET ?? "slidesk.link",
    }),
  )
  .get("/", async ({ jwt, cookie: { auth }, redirect }) => {
    const profile = await jwt.verify(auth.value as string);
    if (!profile) return redirect("/login?back=auth");
    const token = await getToken(Number(profile.id));
    return redirect(`http://localhost:1337/auth/${token}`);
  });

export default auth;
