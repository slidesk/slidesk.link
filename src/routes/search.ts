import Elysia from "elysia";
import markdownIt from "markdown-it";
import componentSearch from "../database/component/search";
import pluginSearch from "../database/plugin/search";
import presentationSearch from "../database/presentation/search";
import templateSearch from "../database/template/search";
import themeSearch from "../database/theme/search";
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
      plugins: {
        slug: string;
        downloaded: number;
        description: string;
        user: string;
      }[];
      components: {
        slug: string;
        downloaded: number;
        description: string;
        user: string;
      }[];
      users: {
        name: string;
        slug: string;
        bio: string;
      }[];
      talks: {
        title: string;
        abstract: string;
        user: string;
        sessions: {
          date: Date;
          location: string;
          url: string | null;
          slides: string | null;
          video: string | null;
        }[];
      }[];
      templates: {
        slug: string;
        downloaded: number;
        description: string;
        user: string;
      }[];
      themes: {
        slug: string;
        downloaded: number;
        description: string;
        user: string;
      }[];
    } = {
      plugins: [],
      components: [],
      users: [],
      talks: [],
      templates: [],
      themes: [],
    };
    const sections = kinds.split(",");
    if (sections.includes("plugins"))
      res.plugins = [...(await pluginSearch(search.toLowerCase()))].map(
        (p) => ({
          slug: p.slug,
          downloaded: p.downloaded,
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
          slug: c.slug,
          downloaded: c.downloaded,
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
        name: u.name ?? "",
        slug: u.slug,
        bio: md.render(u.bio ?? ""),
      }));
    if (sections.includes("talks"))
      res.talks = [...(await presentationSearch(search.toLowerCase()))].map(
        (p) => ({
          title: p.title,
          abstract: md.render(p.abstract ?? ""),
          user: p.user.slug,
          sessions: p.Session.filter((s) => s.status === 1).map((s) => ({
            date: s.date,
            location: s.location,
            url: s.url,
            slides: s.slides,
            video: s.video,
          })),
        }),
      );
    if (sections.includes("templates"))
      res.templates = [...(await templateSearch(search.toLowerCase()))].map(
        (t) => ({
          slug: t.slug,
          downloaded: t.downloaded,
          description: md
            .render(t.description ?? "")
            .replace("<h1", "<h4")
            .replace("</h1", "</h4")
            .replace("<h2", "<h5")
            .replace("</h2", "</h5")
            .replace("<h3", "<h6")
            .replace("</h3", "</h6"),
          user: t.user.slug,
        }),
      );
    if (sections.includes("themes"))
      res.themes = [...(await themeSearch(search.toLowerCase()))].map((t) => ({
        slug: t.slug,
        downloaded: t.downloaded,
        description:
          md
            .render(t.description ?? "")
            .replace("<h1", "<h4")
            .replace("</h1", "</h4")
            .replace("<h2", "<h5")
            .replace("</h2", "</h5")
            .replace("<h3", "<h6")
            .replace("</h3", "</h6") +
          `<div class="images">
            ${[...(JSON.parse(t.tags) ?? [])].map((img) => `<img src="data:image/webp;base64,${img}" width="320" />`).join("")}
          </div>`,
        user: t.user.slug,
      }));

    return Response.json(res);
  });

export default search;
