import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";
import { oauth2 } from "elysia-oauth2";
import { HOST, HOST_IS_HTTPS, JWT_SECRET } from "../services/env";
import getUser from "../services/getUser";

const login = new Elysia({ prefix: "/login" })
  .use(
    oauth2(
      {
        GitHub: [
          Bun.env.GITHUB_OAUTH_CLIENT_ID ?? "",
          Bun.env.GITHUB_OAUTH_CLIENT_SECRET ?? "",
          `${HOST}/login/github/authorized`,
        ],
      },
      {
        cookie: {
          secure: HOST_IS_HTTPS,
        },
      },
    ),
  )
  .use(
    jwt({
      name: "jwt",
      secret: JWT_SECRET,
    }),
  )
  .get("/", ({ oauth2 }) => oauth2.redirect("GitHub", ["read:user"]))
  .get("/github/authorized", async ({ jwt, oauth2 }) => {
    const tokens = await oauth2.authorize("GitHub");

    const accessToken = tokens.accessToken();

    const user = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const dbUser = await getUser(await user.json());

    const value = await jwt.sign({
      id: dbUser?.id ?? "",
    });

    return new Response(null, {
      status: 301,
      headers: {
        Location: "/profile",
        "Set-Cookie": `auth=${value}; Path=/; Max-Age=${7 * 86400}; HttpOnly`,
      },
    });
  });

export default login;
