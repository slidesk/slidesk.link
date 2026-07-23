import markdownIt from "markdown-it";
import { addonRepositories } from "../database/addon/repository";
import presentationGetByUser from "../database/presentation/getByUser";
import extractHeaderComment from "./extractHeaderComment";

const md = markdownIt({ xhtmlOut: true, linkify: true, typographer: true });

// Demote h1-h3 to h4-h6 so user content never competes with the page headings.
const demote = (html: string) =>
  html
    .replace(/<h1/g, "<h4")
    .replace(/<\/h1/g, "</h4")
    .replace(/<h2/g, "<h5")
    .replace(/<\/h2/g, "</h5")
    .replace(/<h3/g, "<h6")
    .replace(/<\/h3/g, "</h6");

const render = (source: string | null | undefined) =>
  demote(md.render(source ?? ""));

type AddonUser = { id: number; name: string | null; slug: string };

interface UserRow {
  id: number | undefined;
  name: string | null;
  slug: string;
  avatarUrl: string | null;
  url: string | null;
  bio: string | null;
}

const bySlug = (a: { slug: string }, b: { slug: string }) =>
  a.slug.localeCompare(b.slug);

const parsePreviews = (tags: string): string[] => {
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Builds the JSON payload for the public speaker page (`GET /api/user/:slug`).
 * Descriptions/bios/abstracts are returned as pre-rendered, demoted markdown
 * HTML; theme previews are returned as a structured base64 array.
 */
export default async (user: UserRow & Partial<AddonUser>) => {
  const userId = Number(user.id);

  const getFirstAccepted = (sessions: { status: number; date: Date }[]) =>
    sessions
      .filter((s) => s.status === 1)
      .map((s) => new Date(s.date).getTime())
      .sort((a, b) => a - b)[0] ?? Number.POSITIVE_INFINITY;

  const presentations = await presentationGetByUser(userId);
  const talks = presentations
    .sort((a, b) => getFirstAccepted(b.Session) - getFirstAccepted(a.Session))
    .map((p) => ({
      id: p.id,
      title: p.title,
      abstractHtml: render(p.abstract),
      sessions: [...p.Session]
        .sort((a, b) => Number(b.date) - Number(a.date))
        .map((s) => ({
          date: s.date,
          location: s.location,
          url: s.url,
          slides: s.slides,
          video: s.video,
          status: s.status,
          presentationId: s.presentationId,
        })),
    }));

  const [plugins, components, templates, themes] = await Promise.all([
    addonRepositories.plugin.getByUser(userId),
    addonRepositories.component.getByUser(userId),
    addonRepositories.template.getByUser(userId),
    addonRepositories.theme.getByUser(userId),
  ]);

  return {
    name: user.name ?? user.slug,
    slug: user.slug,
    avatarUrl: user.avatarUrl,
    url: user.url,
    bioHtml: render(user.bio),
    talks,
    plugins: plugins.toSorted(bySlug).map((p) => ({
      slug: p.slug,
      downloaded: p.downloaded,
      descriptionHtml: render(p.description),
    })),
    components: components.toSorted(bySlug).map((c) => ({
      slug: c.slug,
      downloaded: c.downloaded,
      descriptionHtml: render(extractHeaderComment(c.description ?? "")),
    })),
    templates: templates.toSorted(bySlug).map((t) => ({
      slug: t.slug,
      downloaded: t.downloaded,
      descriptionHtml: render(t.description),
    })),
    themes: themes.toSorted(bySlug).map((t) => ({
      slug: t.slug,
      downloaded: t.downloaded,
      descriptionHtml: render(t.description),
      previews: parsePreviews(t.tags),
    })),
  };
};
