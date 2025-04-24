import { Elysia, t } from "elysia";
import { extract } from "tar";
import addHostedPresentation from "../database/addHostedPresentation";

const upload = new Elysia({
  prefix: "/upload",
  serve: { maxRequestBodySize: 100 * 1024 * 1024 },
}).post(
  "/",
  async ({ body }) => {
    const uuid = Bun.randomUUIDv7();
    await addHostedPresentation(uuid);
    await Bun.write(
      `${process.cwd()}/presentations/${uuid}/link.tgz`,
      body.file,
    );
    await extract({
      file: `${process.cwd()}/presentations/${uuid}/link.tgz`,
      C: `${process.cwd()}/presentations/${uuid}`,
    });
    await Bun.file(`${process.cwd()}/presentations/${uuid}/link.tgz`).unlink();
    return uuid;
  },
  {
    body: t.Object({
      file: t.File(),
    }),
  },
);
export default upload;
