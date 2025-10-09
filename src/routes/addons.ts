import { Elysia, t } from "elysia";
import componentGetByUserAndSlug from "../database/component/getByUserAndSlug";
import componentSearch from "../database/component/search";
import componentUpsert from "../database/component/upsert";
import pluginGetByUserAndSlug from "../database/plugin/getByUserAndSlug";
import pluginSearch from "../database/plugin/search";
import pluginUpsert from "../database/plugin/upsert";
import themeUpsert from "../database/theme/upsert";
import checkSlug from "../database/user/checkSlug";
import checkToken from "../database/user/checkToken";
import createUserPage from "../services/createUserPage";

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
      if (!["plugin", "component", "theme"].includes(body.type))
        return new Response("err: No type allowed", { status: 403 });
      await Bun.write(
        `${process.cwd()}/app/${body.type}s/${user.id}/${body.name}.tgz`,
        body.file,
      );
      switch (body.type) {
        case "plugin":
          await pluginUpsert(
            body.name.toLowerCase(),
            user.id,
            (JSON.parse(body.json).tags ?? [])
              .map((t: string) => t.toLowerCase())
              .join("|"),
            body.desc,
          );
          break;
        case "component":
          await componentUpsert(
            body.name.toLowerCase(),
            user.id,
            (JSON.parse(body.json).tags ?? [])
              .map((t: string) => t.toLowerCase())
              .join("|"),
            body.desc,
          );
          break;
        case "theme":
          await themeUpsert(
            body.name.toLowerCase(),
            user.id,
            (JSON.parse(body.json).tags ?? [])
              .map((t: string) => t.toLowerCase())
              .join("|"),
            body.desc,
          );
          break;
      }
      await createUserPage(user);
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
    if (!["plugin", "component", "theme"].includes(kind))
      return new Response("Wrong kind of asset", { status: 403 });
    let finds: {
      user: {
        slug: string;
      };
      slug: string;
      tags: string;
    }[] = [];
    switch (kind) {
      case "plugin":
        finds = await pluginSearch(search.toLowerCase());
        break;
      case "component":
        finds = await componentSearch(search.toLowerCase());
        break;
    }
    if (finds.length === 0) return new Response("not found", { status: 404 });
    return Response.json(finds.map((f) => `@${f.user.slug}/${f.slug}`));
  })
  .get(
    "/download/:kind/:user/:name",
    async ({ params: { kind, name, user } }) => {
      if (!["plugin", "component", "theme"].includes(kind))
        return new Response("Wrong kind of asset", { status: 403 });
      const _user = await checkSlug(user);
      if (!_user) return new Response("User not found", { status: 404 });
      switch (kind) {
        case "plugin": {
          const plugin = await pluginGetByUserAndSlug(_user.id, name);
          if (plugin) {
            return Bun.file(
              `${process.cwd()}/app/plugins/${plugin.userId}/${plugin.slug}.tgz`,
            );
          }
          return new Response("Plugin not found", { status: 404 });
        }
        case "component": {
          const component = await componentGetByUserAndSlug(_user.id, name);
          if (component) {
            return Bun.file(
              `${process.cwd()}/app/components/${component.userId}/${component.slug}.tgz`,
            );
          }
          return new Response("Component not found", { status: 404 });
        }
      }
    },
  );
export default addons;
