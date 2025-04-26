import Elysia from "elysia";
import { jwt } from "@elysiajs/jwt";

const profile = new Elysia({ prefix: "/profile" })
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET ?? "slidesk.link",
    }),
  )
  .get("/", async ({ jwt, cookie: { auth }, redirect }) => {
    const profile = await jwt.verify(auth.value);

    if (!profile) return redirect("/home");
  });

export default profile;
