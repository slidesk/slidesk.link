import { Elysia } from "elysia";
import { cron } from "@elysiajs/cron";
import staticPlugin from "@elysiajs/static";
import oauth from "./oauth";
import login from "./routes/login";
import home from "./routes/home";
import mainCSS from "./views/css/main.css" with { type: "text" };
import user from "./routes/user";
import upload from "./routes/upload";
import cronService from "./services/cron";

const app = new Elysia()
  .use(oauth)
  .use(staticPlugin())
  .use(
    cron({
      name: "clean",
      pattern: "*/10 * * * * *",
      run() {
        cronService();
      },
    }),
  )
  .use(home)
  .use(user)
  .use(login)
  .use(upload)
  .get(
    "/main.css",
    () => new Response(mainCSS, { headers: { "Content-Type": "text/css" } }),
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);
