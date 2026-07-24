import Elysia from "elysia";
import { addonRepositories } from "../database/addon/repository";
import presentationSearch from "../database/presentation/search";
import userSearch from "../database/user/search";
import extractHeaderComment from "../services/extractHeaderComment";
import { render, renderDemoted } from "../services/markdown";

const search = new Elysia({ prefix: "/search" }).post(
  "/:search/:kinds",
  async ({ params: { search, kinds } }) => {
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
        avatarUrl: string | null;
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
    if (search === "*") search = "";
    if (sections.includes("plugins"))
      res.plugins = [
        ...(await addonRepositories.plugin.search(search.toLowerCase())),
      ].map((p) => ({
        slug: p.slug,
        downloaded: p.downloaded,
        description: renderDemoted(p.description ?? ""),
        user: p.user.slug,
      }));
    if (sections.includes("components"))
      res.components = [
        ...(await addonRepositories.component.search(search.toLowerCase())),
      ].map((c) => ({
        slug: c.slug,
        downloaded: c.downloaded,
        description: renderDemoted(extractHeaderComment(c.description ?? "")),
        user: c.user.slug,
      }));
    if (sections.includes("users"))
      res.users = [...(await userSearch(search.toLowerCase()))].map((u) => ({
        name: u.name ?? "",
        slug: u.slug,
        avatarUrl: u.avatarUrl,
        bio: render(u.bio ?? ""),
      }));
    if (sections.includes("talks"))
      res.talks = [...(await presentationSearch(search.toLowerCase()))].map(
        (p) => ({
          title: p.title,
          abstract: render(p.abstract ?? ""),
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
      res.templates = [
        ...(await addonRepositories.template.search(search.toLowerCase())),
      ].map((t) => ({
        slug: t.slug,
        downloaded: t.downloaded,
        description: renderDemoted(t.description ?? ""),
        user: t.user.slug,
      }));
    if (sections.includes("themes"))
      res.themes = [
        ...(await addonRepositories.theme.search(search.toLowerCase())),
      ].map((t) => ({
        slug: t.slug,
        downloaded: t.downloaded,
        description:
          renderDemoted(t.description ?? "") +
          `<div class="images">
            ${[...(JSON.parse(t.tags) ?? [])].map((img) => `<img src="data:image/webp;base64,${img}" width="320" />`).join("")}
          </div>`,
        user: t.user.slug,
      }));

    return Response.json(res);
  },
);

export default search;
