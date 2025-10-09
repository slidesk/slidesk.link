import { rmSync } from "node:fs";
import { jwt } from "@elysiajs/jwt";
import Elysia, { t } from "elysia";
import getComponentsGetByUser from "../database/component/getByUser";
import deleteHostedById from "../database/hostedPresentation/deleteById";
import getHostedsByUser from "../database/hostedPresentation/getByUser";
import getPluginsGetByUser from "../database/plugin/getByUser";
import checkPresentationIdAndUserId from "../database/presentation/checkIdAndUserId";
import deletePresentationById from "../database/presentation/deleteById";
import getPresentationsByUser from "../database/presentation/getByUser";
import deleteSessionById from "../database/session/deleteById";
import deleteSessionsByPresentationId from "../database/session/deleteByPresentationId";
import getSessionById from "../database/session/getById";
import checkId from "../database/user/checkId";
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
    const profile = await jwt.verify(auth.value as string);

    if (!profile) return redirect("/");
    return new Response(Bun.file(`${process.cwd()}/dist-html/profile.html`), {
      headers: { "Content-Type": "text/html" },
    });
  })
  .get("/data", async ({ jwt, cookie: { auth } }) => {
    const profile = await jwt.verify(auth.value as string);

    if (!profile) return new Response("Unauthorized", { status: 401 });

    const user = await checkId(Number(profile.id));

    return new Response(
      JSON.stringify({
        form: {
          name: user?.name,
          slug: user?.slug,
          avatarUrl: user?.avatarUrl,
          url: user?.url,
          bio: user?.bio,
        },
        hosted: await getHostedsByUser(Number(profile.id)),
        presentations: await getPresentationsByUser(Number(profile.id)),
        plugins: await getPluginsGetByUser(Number(profile.id)),
        components: await getComponentsGetByUser(Number(profile.id)),
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  })
  .post(
    "/",
    async ({ jwt, cookie: { auth }, body, redirect }) => {
      const profile = await jwt.verify(auth.value as string);
      if (!profile) return new Response("Unauthorized", { status: 401 });

      const user = await checkId(Number(profile.id));
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
  )
  .delete(
    "/presentation/:id",
    async ({ jwt, cookie: { auth }, params: { id } }) => {
      const profile = await jwt.verify(auth.value as string);
      if (!profile) return new Response("Unauthorized", { status: 401 });
      const pres = await checkPresentationIdAndUserId(
        Number(id),
        Number(profile.id),
      );
      if (pres) {
        await deleteSessionsByPresentationId(Number(id));
        await deletePresentationById(Number(id));
        return new Response("OK", { status: 200 });
      }
      return new Response("Unauthorized", { status: 401 });
    },
  )
  .delete("/session/:id", async ({ jwt, cookie: { auth }, params: { id } }) => {
    const profile = await jwt.verify(auth.value as string);
    if (!profile) return new Response("Unauthorized", { status: 401 });
    const session = await getSessionById(Number(id));
    if (
      session &&
      (await checkPresentationIdAndUserId(
        session.presentationId,
        Number(profile.id),
      ))
    ) {
      await deleteSessionById(Number(id));
      return new Response("OK", { status: 200 });
    }
    return new Response("Unauthorized", { status: 401 });
  })
  .delete("/hosted/:id", async ({ jwt, cookie: { auth }, params: { id } }) => {
    const profile = await jwt.verify(auth.value as string);
    if (!profile) return new Response("Unauthorized", { status: 401 });
    const hosted = [...(await getHostedsByUser(Number(profile.id)))].map(
      (h) => h.id,
    );
    if (hosted.includes(id)) {
      await deleteHostedById(id);
      rmSync(`${process.cwd()}/app/presentations/${id}`, {
        recursive: true,
        force: true,
      });
      return new Response("OK", { status: 200 });
    }
    return new Response("Unauthorized", { status: 401 });
  });

export default profile;
