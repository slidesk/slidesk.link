import Elysia, { t } from "elysia";
import checkToken from "../database/user/checkToken";
import addTalkAndSessions from "../services/addTalkAndSessions";

const pushtotalk = new Elysia({ prefix: "/pushtotalk" }).post(
  "/",
  async ({ body, headers }) => {
    if (!headers["x-slidesk"])
      return new Response("No token found", { status: 404 });
    const user = await checkToken(headers["x-slidesk"]);
    if (!user) return new Response("user not found", { status: 404 });
    await addTalkAndSessions(await body.file.text(), user);
    return new Response("", { status: 201 });
  },
  {
    body: t.Object({
      file: t.File(),
    }),
  },
);

export default pushtotalk;
