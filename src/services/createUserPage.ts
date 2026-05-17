import { Glob } from "bun";
import markdownIt from "markdown-it";
import { minify } from "minify";
import componentGetByUser from "../database/component/getByUser";
import pluginGetByUser from "../database/plugin/getByUser";
import presentationGetByUser from "../database/presentation/getByUser";
import templateGetByUser from "../database/template/getByUser";
import themeGetByUser from "../database/theme/getByUser";
import { db } from "../db";
import { userPageHtml } from "../html/pages/user";
import type { SlideskLinkSession, SlideskLinkUser } from "../types";
import extractHeaderComment from "./extractHeaderComment";

const md = markdownIt({
  xhtmlOut: true,
  linkify: true,
  typographer: true,
});

export default async (u: SlideskLinkUser) => {
  const getSessionDate = (session: SlideskLinkSession) =>
    session.status === 1 ? new Date(session.date).getTime() : 0;
  const getLastDate = (sessions: SlideskLinkSession[] | undefined) =>
    sessions?.sort((a, b) => getSessionDate(b) - getSessionDate(a))[0]?.date ??
    0;
  const presentations = (await presentationGetByUser(Number(u.id)))?.sort(
    (a, b) => (getLastDate(a.Session) > getLastDate(b.Session) ? -1 : 1),
  );

  const talks = [];
  for (const p of presentations) {
    talks.push({
      id: p.id,
      title: p.title,
      abstractHtml: md.render(p.abstract ?? ""),
      sessions: p.Session.sort(
        (a: SlideskLinkSession, b: SlideskLinkSession) =>
          Number(b.date) - Number(a.date),
      ).map((s) => ({
        date: s.date,
        location: s.location,
        url: s.url,
        slides: s.slides,
        video: s.video,
        status: s.status,
        presentationId: s.presentationId,
      })),
    });
  }

  const plugins = (await pluginGetByUser(u.id as number)).toSorted((a, b) =>
    a.slug.localeCompare(b.slug),
  );
  const components = (await componentGetByUser(u.id as number)).toSorted(
    (a, b) => a.slug.localeCompare(b.slug),
  );
  const themes = (await themeGetByUser(u.id as number)).toSorted((a, b) =>
    a.slug.localeCompare(b.slug),
  );
  const templates = (await templateGetByUser(u.id as number)).toSorted((a, b) =>
    a.slug.localeCompare(b.slug),
  );

  const sanitizeHTML = (html: string) =>
    html
      .replace("<h1", "<h4")
      .replace("</h1", "</h4")
      .replace("<h2", "<h5")
      .replace("</h2", "</h5")
      .replace("<h3", "<h6")
      .replace("</h3", "</h6");

  const html = userPageHtml({
    name: u.name ?? "",
    slug: u.slug,
    avatarUrl: u.avatarUrl,
    bio: u.bio,
    bioHtml: u.bio ? md.render(u.bio) : "",
    url: u.url,
    talks,
    plugins: plugins.map((p) => ({
      slug: p.slug,
      downloaded: p.downloaded,
      description: sanitizeHTML(md.render(p.description ?? "")),
    })),
    components: components.map((c) => ({
      slug: c.slug,
      downloaded: c.downloaded,
      description: sanitizeHTML(
        md.render(extractHeaderComment(c.description ?? "")),
      ),
    })),
    themes: themes.map((t) => ({
      slug: t.slug,
      downloaded: t.downloaded,
      description:
        sanitizeHTML(md.render(t.description ?? "")) +
        `<div class="images">${[...(JSON.parse(t.tags) ?? [])].map((img: string) => `<img src="data:image/webp;base64,${img}" width="320" />`).join("")}</div>`,
    })),
    templates: templates.map((t) => ({
      slug: t.slug,
      downloaded: t.downloaded,
      description: sanitizeHTML(md.render(t.description ?? "")),
    })),
  });

  const glob = new Glob("*.css");
  let sha = "";
  for await (const file of glob.scanSync(`${process.cwd()}/dist-html`)) {
    sha = file;
  }

  const final = await minify.html(
    html.replace(
      "</head>",
      `<link rel=stylesheet href=/css/${sha.replace(".css", "")}></head>`,
    ),
  );

  await Bun.write(`${process.cwd()}/app/users/${u.slug}.html`, final);
  await db.user.update({
    data: { updatedAt: new Date() },
    where: { id: u.id },
  });
  return final;
};
