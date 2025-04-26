import Elysia, { t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import checkGithub from "../database/user/checkGithub";
import update from "../database/user/update";
import createUserPage from "../services/createUserPage";

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
    return new Response(Bun.file(`${process.cwd()}/dist/profile.html`), {
      headers: { "Content-Type": "text/html" },
    });
  })
  .get("/data", async ({ jwt, cookie: { auth } }) => {
    const profile = await jwt.verify(auth.value);

    if (!profile) return new Response("Unauthorized", { status: 401 });

    const user = await checkGithub(Number(profile.id));

    return new Response(
      JSON.stringify({
        name: user?.name,
        slug: user?.slug,
        avatarUrl: user?.avatarUrl,
        url: user?.url,
        bio: user?.bio,
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  })
  .post(
    "/",
    async ({ jwt, cookie: { auth }, body, redirect }) => {
      const profile = await jwt.verify(auth.value);
      if (!profile) return new Response("Unauthorized", { status: 401 });

      const user = await checkGithub(Number(profile.id));
      if (user) {
        await update(user.id, body);
        await createUserPage(user);
      }

      return redirect("/profile");
    },
    {
      body: t.Object({
        name: t.String(),
        slug: t.String(),
        avatarUrl: t.String(),
        url: t.String(),
        bio: t.String(),
      }),
    },
  );

export default profile;
