import { Elysia, t } from "elysia";
import componentUpsert from "../database/component/upsert";
import pluginUpsert from "../database/plugin/upsert";
import themeUpsert from "../database/theme/upsert";
import checkToken from "../database/user/checkToken";

const addons = new Elysia({
  prefix: "/addons",
  serve: { maxRequestBodySize: 100 * 1024 * 1024 },
}).post(
  "/",
  async ({ body, headers }) => {
    if (!headers["x-slidesk"])
      return new Response("err: No token found", { status: 401 });
    const user = await checkToken(headers["x-slidesk"]);
    if (!user) return new Response("err: No user found", { status: 403 });
    if (!["plugin", "component", "theme"].includes(body.type))
      return new Response("err: No type allowed", { status: 403 });
    await Bun.write(
      `${process.cwd()}/${body.type}s/${user.id}/${body.name}.tgz`,
      body.file,
    );
    switch (body.type) {
      case "plugin":
        await pluginUpsert(
          body.name,
          user.id,
          (JSON.parse(body.json).tags ?? []).join("|"),
        );
        break;
      case "component":
        await componentUpsert(
          body.name,
          user.id,
          (JSON.parse(body.json).tags ?? []).join("|"),
        );
        break;
      case "theme":
        await themeUpsert(
          body.name,
          user.id,
          (JSON.parse(body.json).tags ?? []).join("|"),
        );
        break;
    }
    return new Response("", { status: 201 });
  },
  {
    body: t.Object({
      file: t.File(),
      type: t.String(),
      name: t.String(),
      json: t.String(),
    }),
  },
);
export default addons;
