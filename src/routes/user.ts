import { Elysia } from "elysia";
import checkSlug from "../database/user/checkSlug";
import createUserPage from "../services/createUserPage";

const user = new Elysia({ prefix: "/u" }).get(
  "/:user",
  async ({ params: { user } }) => {
    const u = await checkSlug(user);
    if (!u) return new Response("User not found", { status: 404 });
    const userPage = Bun.file(`${process.cwd()}/users/${u.slug}.html`);
    let page = "";
    if (await userPage.exists()) {
      page = await userPage.text();
    } else {
      page = await createUserPage(u);
    }
    return new Response(page, { headers: { "Content-Type": "text/html" } });
  },
);

export default user;
