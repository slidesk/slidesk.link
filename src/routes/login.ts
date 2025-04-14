function userPage(user: object, logout: string) {
  const html = `<!DOCTYPE html>
    <html lang="en">
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.classless.min.css"
    >
    <body>
      User:
      <pre>${JSON.stringify(user, null, "\t")}</pre>
      <a href="${logout}">Logout</a>
    </body>
    </html>`;

  return new Response(html, { headers: { "Content-Type": "text/html" } });
}

import { Elysia } from "elysia";
import oauth from "../oauth";

const login = new Elysia({ prefix: "/login" })
  .use(oauth)
  .get("/", async (ctx) => {
    const profiles = ctx.profiles();

    if (await ctx.authorized("github")) {
      const user = await fetch("https://api.github.com/user", {
        headers: await ctx.tokenHeaders("github"),
      });
      return userPage(await user.json(), profiles.github.logout);
    }
    if (await ctx.authorized("google")) {
      const user = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: await ctx.tokenHeaders("google"),
        },
      );

      return userPage(await user.json(), profiles.google.logout);
    }

    const html = `<!DOCTYPE html>
    <html lang="en">
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.classless.min.css"
    >
    <body>
      <h2>Login with</h2>
      <ul>
              ${Object.entries(profiles)
                .map(
                  ([name, { login }]) =>
                    `<li><a href="${login}">${name}</a></li>`,
                )
                .join("\n")}
            </ul>
    </body>
    </html>`;

    return new Response(html, { headers: { "Content-Type": "text/html" } });
  });

export default login;
