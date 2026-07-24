import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";
import checkId from "../database/user/checkId";
import checkSlug from "../database/user/checkSlug";
import getAllUsers from "../database/user/getAll";
import { JWT_SECRET } from "../services/env";
import getUserPageData from "../services/getUserPageData";
import { render } from "../services/markdown";

// Lets the SPA know who (if anyone) is logged in, since the `auth` cookie is
// HttpOnly and unreadable from JS. Replaces the server-side index/index-logged
// branch of the old home route.
const me = new Elysia({ prefix: "/api" })
  .use(jwt({ name: "jwt", secret: JWT_SECRET }))
  .get("/me", async ({ jwt, cookie: { auth }, set }) => {
    const profile = await jwt.verify(auth.value as string);
    if (!profile) {
      set.status = 401;
      return "Unauthorized";
    }
    const user = await checkId(Number(profile.id));
    if (!user) {
      set.status = 401;
      return "Unauthorized";
    }
    return { slug: user.slug, name: user.name, avatarUrl: user.avatarUrl };
  })
  .get("/user/:slug", async ({ params: { slug }, set }) => {
    const user = await checkSlug(slug);
    if (!user) {
      set.status = 404;
      return "User not found";
    }
    return getUserPageData(user);
  })
  .get("/users", async () => {
    const users = await getAllUsers();
    return users.map((u) => ({
      name: u.name ?? "",
      slug: u.slug,
      avatarUrl: u.avatarUrl,
      url: u.url,
      bioHtml: render(u.bio ?? ""),
    }));
  });

export default me;
