import { Elysia } from "elysia";
import { cron } from "@elysiajs/cron";
import staticPlugin from "@elysiajs/static";
import oauth from "./oauth";
import login from "./routes/login";
import home from "./routes/home";
import user from "./routes/user";
import upload from "./routes/upload";
import cronService from "./services/cron";
import hosted from "./routes/hosted";
import auth from "./routes/auth";
import profile from "./routes/profile";
import exit from "./routes/exit";
import pushtotalk from "./routes/pushtotalk";
import sitemap from "./routes/sitemap";

const app = new Elysia()
  .use(oauth)
  .use(staticPlugin())
  .use(
    cron({
      name: "clean",
      pattern: "* */10 * * * *",
      run() {
        cronService();
      },
    }),
  )
  .use(home)
  .use(user)
  .use(login)
  .use(upload)
  .use(hosted)
  .use(auth)
  .use(profile)
  .use(exit)
  .use(pushtotalk)
  .use(sitemap)
  .ws("/s/:uuid/ws", {
    message(ws, message) {
      ws.publish(ws.data.params.uuid, message);
    },
    open(ws) {
      ws.subscribe(ws.data.params.uuid);
    },
    close(ws) {
      ws.unsubscribe(ws.data.params.uuid);
    },
  })
  .listen(3000);

console.log(
  `🦊 Slidesk.link is running at http://${app.server?.hostname}:${app.server?.port}`,
);
