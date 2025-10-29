import { cron } from "@elysiajs/cron";
import staticPlugin from "@elysiajs/static";
import { Elysia } from "elysia";
import addons from "./routes/addons";
import auth from "./routes/auth";
import exit from "./routes/exit";
import home from "./routes/home";
import hosted from "./routes/hosted";
import login from "./routes/login";
import profile from "./routes/profile";
import pushtotalk from "./routes/pushtotalk";
import sitemap from "./routes/sitemap";
import upload from "./routes/upload";
import user from "./routes/user";
import cronService from "./services/cron";
import search from "./routes/search";

const app = new Elysia()
  .use(staticPlugin())
  .use(
    cron({
      name: "clean",
      pattern: "*/10 * * * *",
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
  .use(addons)
  .use(search)
  .get("/api/proxy-pdf", async ({ query, set }) => {
    try {
      const response = await fetch(query.url);
      if (!response.ok) {
        set.status = response.status;
        return "Erreur téléchargement";
      }
      set.headers = {
        "Content-Type": "application/pdf",
        "Cache-Control": "public, max-age=3600",
      };
      return new Response(response.body);
    } catch (error) {
      console.error("Erreur:", error);
      set.status = 500;
      return "Erreur serveur";
    }
  })
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
