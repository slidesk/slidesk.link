import { Elysia } from "elysia";
import oauth2, {
  github,
  google,
  type TOAuth2AccessToken,
} from "@bogeychan/elysia-oauth2";

import { randomBytes } from "crypto";

const globalState = randomBytes(8).toString("hex");
let globalToken: TOAuth2AccessToken | undefined;

const app = new Elysia();

const auth = oauth2({
  profiles: {
    // define multiple OAuth 2.0 profiles
    github: {
      provider: github(),
      scope: ["user"],
    },
    google: {
      provider: google(),
      scope: ["https://www.googleapis.com/auth/userinfo.profile"],
    },
  },
  state: {
    // custom state verification between requests
    check(ctx, name, state) {
      return state === globalState;
    },
    generate(ctx, name) {
      return globalState;
    },
  },
  storage: {
    // storage of users' access tokens is up to you
    get(ctx, name) {
      return globalToken;
    },
    set(ctx, name, token) {
      globalToken = token;
    },
    delete(ctx, name) {
      globalToken = undefined;
    },
  },
});

function userPage(user: {}, logout: string) {
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

app
  .use(auth)
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
        "https://www.googleapis.com/oauth2/v1/userinfo",
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
  })
  .listen(3000);
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
