import { jwt } from "@elysiajs/jwt";
import Elysia from "elysia";
import getToken from "../database/user/getToken";
import { JWT_SECRET } from "../services/env";

const auth = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: JWT_SECRET,
    }),
  )
  .get("/", async ({ jwt, cookie: { auth }, redirect }) => {
    const profile = await jwt.verify(auth.value as string);
    if (!profile) return redirect("/login?back=auth");
    const token = await getToken(Number(profile.id));
    return redirect(`http://localhost:1337/auth/${token}`);
  });

export default auth;
