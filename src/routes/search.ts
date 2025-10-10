import Elysia from "elysia";
import markdownIt from "markdown-it";
import componentSearch from "../database/component/search";
import pluginSearch from "../database/plugin/search";
import extractHeaderComment from "../services/extractHeaderComment";

const search = new Elysia({ prefix: "/search" })
  .get("/", () => Bun.file(`${process.cwd()}/dist-html/search.html`))
  .post("/:search", async ({ params: { search } }) => {
    const md = markdownIt({
      xhtmlOut: true,
      linkify: true,
      typographer: true,
    });
    return Response.json({
      plugins: [...(await pluginSearch(search.toLowerCase()))].map((p) => ({
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
      })),
      components: [...(await componentSearch(search.toLowerCase()))].map(
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
      ),
    });
  });

export default search;
