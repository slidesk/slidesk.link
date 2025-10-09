import { Elysia, t } from "elysia";
import { extract } from "tar";
import addHostedPresentation from "../database/hostedPresentation/add";
import checkToken from "../database/user/checkToken";
import countByUser from "../database/hostedPresentation/countByUser";

const upload = new Elysia({
  prefix: "/upload",
  serve: { maxRequestBodySize: 100 * 1024 * 1024 },
}).post(
  "/",
  async ({ body, headers }) => {
    if (!headers["x-slidesk"]) return "err: No token found";
    const user = await checkToken(headers["x-slidesk"]);
    if (!user) return "err: No user found";
    const count = await countByUser(user.id);
    if (count >= 5) return "err: Too many presentations, wait 72h";
    const uuid = Bun.randomUUIDv7();
    await addHostedPresentation(uuid, user.id);
    await Bun.write(
      `${process.cwd()}/app/presentations/${uuid}/link.tgz`,
      body.file,
    );
    await extract({
      file: `${process.cwd()}/app/presentations/${uuid}/link.tgz`,
      C: `${process.cwd()}/app/presentations/${uuid}`,
    });
    await Bun.file(
      `${process.cwd()}/app/presentations/${uuid}/link.tgz`,
    ).unlink();
    return uuid;
  },
  {
    body: t.Object({
      file: t.File(),
    }),
  },
);
export default upload;
