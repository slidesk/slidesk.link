import { Elysia } from "elysia";

// Serves the built React SPA shell. Only an EXPLICIT, finite list of app routes
// is registered here so it can never shadow the API / file / SEO routes.
export const shell = () =>
  new Response(Bun.file(`${process.cwd()}/dist-client/index.html`), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });

const spa = new Elysia()
  .get("/", shell)
  .get("/mentions", shell)
  .get("/components", shell)
  .get("/components/", shell)
  .get("/plugins", shell)
  .get("/plugins/", shell)
  .get("/templates", shell)
  .get("/templates/", shell)
  .get("/themes", shell)
  .get("/themes/", shell)
  .get("/search", shell)
  .get("/search/", shell);
// NOTE: GET /profile is served by the profile module itself (it owns the
// /profile prefix, which would otherwise shadow a shell route here).

export default spa;
