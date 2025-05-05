import markdownIt from "markdown-it";
import { minify } from "minify";
import type { SlideskLinkUser } from "../types";
import userPage from "../html/user.html" with { type: "text" };
import { Glob } from "bun";
import getByUser from "../database/presentation/getByUser";
import { db } from "../db";

const md = markdownIt({
  xhtmlOut: true,
  linkify: true,
  typographer: true,
});

export default async (u: SlideskLinkUser) => {
  let html = userPage
    .replaceAll("#NAME", u.name)
    .replaceAll("#SLUG", u.slug)
    .replaceAll("#AVATAR", u.avatarUrl);
  if (u.bio) html = html.replaceAll("#BIO_BRUT", u.bio);
  else html = html.replaceAll("#BIO_BRUT", "");
  if (u.bio) html = html.replaceAll("#BIO", md.render(u.bio));
  else html = html.replaceAll("#BIO", "");
  if (u.url)
    html = html.replaceAll(
      "#URL",
      `<a href="${u.url}" target="_blank" rel="noopener"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link-icon lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>${u.url}</a>`,
    );
  else html = html.replaceAll("#URL", "");
  const presentations = await getByUser(Number(u.id));
  const toc: string[] = [];
  const talks: string[] = [];
  const iconStatus = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket-x-icon lucide-ticket-x"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9.5 14.5 5-5"/><path d="m9.5 9.5 5 5"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket-check-icon lucide-ticket-check"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9 12 2 2 4-4"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket-slash-icon lucide-ticket-slash"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9.5 14.5 5-5"/></svg>',
  ];
  const textStatus = ["Rejected", "Accepted", "Declined"];
  for await (const p of presentations) {
    toc.push(`<a href="#t${p.id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash-icon lucide-hash"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>
        ${p.title}
    </a>`);
    talks.push(`
      <article>
        <details>
            <summary>
                <h3 id="t${p.id}">
                    ${p.title}
                </h3>
            </summary>
            <blockquote>${md.render(p.abstract ?? "")}</blockquote>
        </details>
        <footer>
            ${p.Session.sort((a, b) => Number(a.date) - Number(b.date))
              .map(
                (s, _) => `
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-days-icon lucide-calendar-days"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
                  ${new Date(s.date).toISOString().split("T")[0]}: ${s.location}
                  ${
                    s.url
                      ? `
                    <a href="${s.url}" data-tooltip="More info" aria-label="More info" target="_blank" rel="noopener">
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                      ><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path
                              d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                          /></svg>
                    </a>
                  `
                      : ""
                  }
                  ${
                    s.slides
                      ? `
                    <a href="${s.slides}" data-tooltip="See presentation" aria-label="See presentation" target="_blank" rel="noopener">
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                      ><path d="M2 3h20M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3M7 21l5-5 5 5" /></svg>
                    </a>
                  `
                      : ""
                  }
                  ${
                    s.video
                      ? `
                    <a href="${s.video}" data-tooltip="See video" aria-label="See video" target="_blank" rel="noopener">
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                      ><path
                              d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3ZM6.2 5.3l3.1 3.9M12.4 3.4l3.1 4M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"
                          /></svg>
                    </a>
                  `
                      : ""
                  }
                  <span class="icon-status status-${s.status}" data-tooltip="${textStatus[s.status]}">${iconStatus[s.status]}</span>
                </div>
              `,
              )
              .join("")}
        </footer>
    </article>
    `);
  }
  html = html.replaceAll("#TOC", "");

  if (talks.length) html = html.replaceAll("#TALKS", talks.join(""));
  else html = html.replaceAll("#TALKS", "");

  html = await minify.html(html);
  const glob = new Glob("*.css");
  let sha = "";
  for await (const file of glob.scanSync(`${process.cwd()}/public`)) {
    sha = file;
  }
  html = html.replace(
    "<meta charset=utf-8>",
    `<meta charset=utf-8><link rel=stylesheet href=/public/${sha}>`,
  );
  await Bun.write(`${process.cwd()}/users/${u.slug}.html`, html);
  await db.user.update({
    data: { updatedAt: new Date() },
    where: { id: u.id },
  });
  return html;
};
