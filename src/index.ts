import { cron } from "@elysiajs/cron";
import staticPlugin from "@elysiajs/static";
import { Elysia } from "elysia";
import { mcpRoutes } from "../mcp/elysia";
import addonPage from "./routes/addon-page";
import addons from "./routes/addons";
import auth from "./routes/auth";
import exit from "./routes/exit";
import hosted from "./routes/hosted";
import login from "./routes/login";
import me from "./routes/me";
import profile from "./routes/profile";
import pushtotalk from "./routes/pushtotalk";
import search from "./routes/search";
import sitemap from "./routes/sitemap";
import spa from "./routes/spa";
import upload from "./routes/upload";
import user from "./routes/user";
import cronService from "./services/cron";
import { isValidUuid } from "./services/paths";
import { assertSafeUrl } from "./services/safe-fetch";

const app = new Elysia()
  .use(staticPlugin())
  .use(
    staticPlugin({
      assets: "dist-client/assets",
      prefix: "/assets",
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    }),
  )
  .use(
    cron({
      name: "clean",
      pattern: "*/10 * * * *",
      run() {
        cronService();
      },
    }),
  )
  .use(user)
  .use(login)
  .use(me)
  .use(upload)
  .use(hosted)
  .use(auth)
  .use(profile)
  .use(exit)
  .use(pushtotalk)
  .use(sitemap)
  .use(addonPage)
  .use(addons)
  .use(search)
  .use(
    // Exposes the addon hub to AI agents at /mcp (same port). Discovery-only;
    // install_addon returns the command for the client to run locally.
    mcpRoutes({
      hostBase: "http://localhost:3000",
      publicBase: Bun.env.HOST ?? "https://slidesk.link",
    }),
  )
  .use(spa)
  .get("/health", () => ({ success: true, message: "healthy" }))
  .get("/api/proxy-pdf", async ({ query, set }) => {
    try {
      await assertSafeUrl(query.url);
    } catch {
      set.status = 400;
      return "URL invalide";
    }
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
      if (!isValidUuid(ws.data.params.uuid)) return;
      ws.publish(ws.data.params.uuid, message);
    },
    open(ws) {
      if (!isValidUuid(ws.data.params.uuid)) {
        ws.close();
        return;
      }
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
