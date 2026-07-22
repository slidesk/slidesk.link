import { Elysia, t } from "elysia";
import { bksy } from "../api/bsky";
import { telegram } from "../api/telegram";
import { addonRepositories, isAddonKind } from "../database/addon/repository";
import checkSlug from "../database/user/checkSlug";
import checkToken from "../database/user/checkToken";
import touchUser from "../database/user/touch";
import { slugify } from "../services/slug";

const addons = new Elysia({
  prefix: "/addons",
  serve: { maxRequestBodySize: 100 * 1024 * 1024 },
})
  .post(
    "/",
    async ({ body, headers }) => {
      if (!headers["x-slidesk"])
        return new Response("err: No token found", { status: 401 });
      const user = await checkToken(headers["x-slidesk"]);
      if (!user) return new Response("err: No user found", { status: 403 });
      if (!isAddonKind(body.type))
        return new Response("err: No type allowed", { status: 403 });
      const slug = slugify(body.name);
      if (!slug)
        return new Response("err: Name must contain at least one letter", {
          status: 400,
        });

      // Plugins/components store their tags list; themes/templates store the
      // raw json payload (e.g. base64 preview images) in the same column.
      let tagsValue = body.json;
      if (body.type === "plugin" || body.type === "component") {
        try {
          const tags = (JSON.parse(body.json).tags ?? []) as string[];
          tagsValue = tags.map((tag) => tag.toLowerCase()).join("|");
        } catch {
          return new Response("err: Invalid json", { status: 400 });
        }
      }

      await telegram(
        JSON.stringify({
          action: "push",
          user: user.slug,
          type: body.type,
          name: slug,
        }),
      );
      await Bun.write(
        `${process.cwd()}/app/${body.type}s/${user.id}/${slug}.tgz`,
        body.file,
      );
      await addonRepositories[body.type].upsert(
        slug,
        user.id,
        tagsValue,
        body.desc,
      );
      await touchUser(user.id);
      await bksy(
        `New ${body.type}! Go to ${Bun.env.HOST}/${body.type}s/#${user.slug}__${slug}`,
        {
          uri: `${Bun.env.HOST}/${body.type}s/#${user.slug}__${slug}`,
          title: `New ${body.type}: ${slug}`,
          description: body.desc ?? "",
          ogImageUrl: `${Bun.env.HOST}/a/${body.type}/${user.slug}/${slug}/og`,
        },
      );
      return new Response("", { status: 201 });
    },
    {
      body: t.Object({
        file: t.File(),
        type: t.String(),
        name: t.String(),
        json: t.String(),
        desc: t.String(),
      }),
    },
  )
  .get("/search/:kind/:search", async ({ params: { kind, search } }) => {
    if (!isAddonKind(kind))
      return new Response("Wrong kind of asset", { status: 403 });
    const finds = await addonRepositories[kind].search(search.toLowerCase());
    if (finds.length === 0) return new Response("not found", { status: 404 });
    return Response.json(finds.map((f) => `@${f.user.slug}/${f.slug}`));
  })
  .get(
    "/download/:kind/:user/:name",
    async ({ params: { kind, name, user } }) => {
      if (!isAddonKind(kind))
        return new Response("Wrong kind of asset", { status: 403 });
      const _user = await checkSlug(user);
      if (!_user) return new Response("User not found", { status: 404 });
      const addon = await addonRepositories[kind].getByUserAndSlug(
        _user.id,
        name,
      );
      if (!addon) return new Response(`${kind} not found`, { status: 404 });
      await telegram(
        JSON.stringify({
          action: "download",
          type: kind,
          user,
          name,
        }),
      );
      await addonRepositories[kind].addDownload(
        addon.userId,
        addon.slug,
        addon.downloaded + 1,
      );
      return Bun.file(
        `${process.cwd()}/app/${kind}s/${addon.userId}/${addon.slug}.tgz`,
      );
    },
  );
export default addons;
