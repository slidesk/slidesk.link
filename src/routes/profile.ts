import { rmSync } from "node:fs";
import { jwt } from "@elysiajs/jwt";
import Elysia, { t } from "elysia";
import {
  type AddonKind,
  addonRepositories,
} from "../database/addon/repository";
import deleteHostedById from "../database/hostedPresentation/deleteById";
import renewHosted from "../database/hostedPresentation/renew";
import getHostedsByUser from "../database/hostedPresentation/getByUser";
import checkPresentationIdAndUserId from "../database/presentation/checkIdAndUserId";
import deletePresentationById from "../database/presentation/deleteById";
import getPresentationsByUser from "../database/presentation/getByUser";
import deleteSessionById from "../database/session/deleteById";
import deleteSessionsByPresentationId from "../database/session/deleteByPresentationId";
import getSessionById from "../database/session/getById";
import checkId from "../database/user/checkId";
import deleteUser from "../database/user/delete";
import getToken from "../database/user/getToken";
import update from "../database/user/update";
import { JWT_SECRET } from "../services/env";
import { shell } from "./spa";

// Delete an addon the user owns, along with its uploaded archive.
// Returns false when the user does not own an addon with that slug.
const deleteOwnedAddon = async (
  kind: AddonKind,
  userId: number,
  slug: string,
): Promise<boolean> => {
  const owned = (await addonRepositories[kind].getByUser(userId)).map(
    (a) => a.slug,
  );
  if (!owned.includes(slug)) return false;
  await addonRepositories[kind].delete(userId, slug);
  await Bun.file(
    `${process.cwd()}/app/${kind}s/${userId}/${slug}.tgz`,
  ).delete();
  return true;
};

// Shared handler body for the four addon deletion routes.
const respondAddonDelete = async (
  jwt: { verify: (token: string) => Promise<false | Record<string, unknown>> },
  token: string,
  kind: AddonKind,
  slug: string,
): Promise<Response> => {
  const profile = await jwt.verify(token);
  if (!profile) return new Response("Unauthorized", { status: 401 });
  const ok = await deleteOwnedAddon(kind, Number(profile.id), slug);
  return ok
    ? new Response("OK", { status: 200 })
    : new Response("Unauthorized", { status: 401 });
};

const profile = new Elysia({ prefix: "/profile" })
  .use(
    jwt({
      name: "jwt",
      secret: JWT_SECRET,
    }),
  )
  // The SPA shell for the /profile route (this module owns the /profile prefix).
  // Auth is gated client-side; unauthenticated users are redirected after
  // /profile/data returns 401.
  .get("/", shell)
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
        plugins: await addonRepositories.plugin.getByUser(Number(profile.id)),
        components: await addonRepositories.component.getByUser(
          Number(profile.id),
        ),
        templates: await addonRepositories.template.getByUser(
          Number(profile.id),
        ),
        themes: await addonRepositories.theme.getByUser(Number(profile.id)),
        token: await getToken(Number(profile.id)),
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
        // update() modifies the user row, so @updatedAt bumps automatically.
        await update(user.id, body);
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
  .delete("/user", async ({ jwt, cookie: { auth } }) => {
    const profile = await jwt.verify(auth.value as string);
    if (!profile) return new Response("Unauthorized", { status: 401 });
    await deleteUser(Number(profile.id));
    auth.remove();
    return new Response(null, {
      status: 301,
      headers: {
        Location: "/",
      },
    });
  })
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
  })
  .put("/hosted/:id/renew", async ({ jwt, cookie: { auth }, params: { id } }) => {
    const profile = await jwt.verify(auth.value as string);
    if (!profile) return new Response("Unauthorized", { status: 401 });
    const res = await renewHosted(id, Number(profile.id));
    if (res.count === 0) return new Response("Not Found", { status: 404 });
    const row = (
      await getHostedsByUser(Number(profile.id))
    ).find((h) => h.id === id);
    return new Response(JSON.stringify({ createdAt: row?.createdAt }), {
      headers: { "Content-Type": "application/json" },
    });
  })
  .delete("/plugin/:slug", ({ jwt, cookie: { auth }, params: { slug } }) =>
    respondAddonDelete(jwt, auth.value as string, "plugin", slug),
  )
  .delete("/component/:slug", ({ jwt, cookie: { auth }, params: { slug } }) =>
    respondAddonDelete(jwt, auth.value as string, "component", slug),
  )
  .delete("/template/:slug", ({ jwt, cookie: { auth }, params: { slug } }) =>
    respondAddonDelete(jwt, auth.value as string, "template", slug),
  )
  .delete("/theme/:slug", ({ jwt, cookie: { auth }, params: { slug } }) =>
    respondAddonDelete(jwt, auth.value as string, "theme", slug),
  );

export default profile;
