import Elysia from "elysia";
import markdownIt from "markdown-it";
import componentSearch from "../database/component/search";
import pluginSearch from "../database/plugin/search";
import presentationSearch from "../database/presentation/search";
import userSearch from "../database/user/search";
import extractHeaderComment from "../services/extractHeaderComment";

const search = new Elysia({ prefix: "/search" })
  .get("/", () => Bun.file(`${process.cwd()}/dist-html/search.html`))
  .post("/:search/:kinds", async ({ params: { search, kinds } }) => {
    const md = markdownIt({
      xhtmlOut: true,
      linkify: true,
      typographer: true,
    });
    const res: {
      plugins: any[];
      components: any[];
      users: any[];
      talks: any[];
    } = {
      plugins: [],
      components: [],
      users: [],
      talks: [],
    };
    const sections = kinds.split(",");
    if (sections.includes("plugins"))
      res.plugins = [...(await pluginSearch(search.toLowerCase()))].map(
        (p) => ({
          ...p,
          description: md
            .render(p.description ?? "")
            .replace("<h1", "<h4")
            .replace("</h1", "</h4")
            .replace("<h2", "<h5")
            .replace("</h2", "</h5")
            .replace("<h3", "<h6")
            .replace("</h3", "</h6"),
          user: p.user.slug,
        }),
      );
    if (sections.includes("components"))
      res.components = [...(await componentSearch(search.toLowerCase()))].map(
        (c) => ({
          ...c,
          description: md
            .render(extractHeaderComment(c.description ?? ""))
            .replace("<h1", "<h4")
            .replace("</h1", "</h4")
            .replace("<h2", "<h5")
            .replace("</h2", "</h5")
            .replace("<h3", "<h6")
            .replace("</h3", "</h6"),
          user: c.user.slug,
        }),
      );
    if (sections.includes("users"))
      res.users = [...(await userSearch(search.toLowerCase()))].map((u) => ({
        name: u.name,
        slug: u.slug,
        bio: md.render(u.bio ?? ""),
      }));
    if (sections.includes("talks"))
      res.talks = [...(await presentationSearch(search.toLowerCase()))].map(
        (p) => ({
          ...p,
          abstract: md.render(p.abstract ?? ""),
          user: p.user.slug,
        }),
      );
    return Response.json(res);
  });

export default search;
