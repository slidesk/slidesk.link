import markdownIt from "markdown-it";
import { minify } from "minify";
import type { SlideskLinkSession, SlideskLinkUser } from "../types";
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
  const getSessionDate = (session: SlideskLinkSession) =>
    session.status === 1 ? new Date(session.date).getTime() : 0;
  const getLastDate = (sessions: SlideskLinkSession[] | undefined) =>
    sessions?.sort((a, b) => getSessionDate(b) - getSessionDate(a))[0].date ??
    0;
  const presentations = (await getByUser(Number(u.id)))?.sort((a, b) =>
    getLastDate(a.Session) > getLastDate(b.Session) ? -1 : 1,
  );
  const talks: string[] = [];
  const iconStatus = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket-x-icon lucide-ticket-x"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9.5 14.5 5-5"/><path d="m9.5 9.5 5 5"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket-check-icon lucide-ticket-check"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9 12 2 2 4-4"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket-slash-icon lucide-ticket-slash"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9.5 14.5 5-5"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket-minus-icon lucide-ticket-minus"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M9 12h6"/></svg>',
  ];
  const textStatus = ["Rejected", "Accepted", "Declined", "Pending"];
  const iconCalendar =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-days-icon lucide-calendar-days"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>';
  const iconLink =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link-icon lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
  const iconSlide =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-presentation-icon lucide-presentation"><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/></svg>';
  const iconVideo =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clapperboard-icon lucide-clapperboard"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>';
  const sessions = [];
  const pres: { [key: number]: string } = {};
  for await (const p of presentations) {
    sessions.push(...p.Session);
    pres[p.id] = p.title;
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
            ${p.Session.sort((a, b) => Number(b.date) - Number(a.date))
              .map(
                (s, _) => `
                <div>
                  <span class="icon-status status-${s.status}" data-tooltip="${textStatus[s.status]}">${iconStatus[s.status]}</span>
                  ${iconCalendar}
                  ${new Date(s.date).toISOString().split("T")[0]}: ${s.location}
                  ${
                    s.url
                      ? `<a href="${s.url}" data-tooltip="More info" aria-label="More info" target="_blank" rel="noopener">${iconLink}</a>`
                      : ""
                  }
                  ${
                    s.slides
                      ? `<a href="${s.slides}" data-tooltip="See presentation" aria-label="See presentation" target="_blank" rel="noopener">${iconSlide}</a>`
                      : ""
                  }
                  ${
                    s.video
                      ? `<a href="${s.video}" data-tooltip="See video" aria-label="See video" target="_blank" rel="noopener">${iconVideo}</a>`
                      : ""
                  }
                </div>
              `,
              )
              .join("")}
        </footer>
    </article>
    `);
  }
  html = html.replaceAll(
    "#TOC",
    sessions.length
      ? `<span><b>Last talk(s):</b></span><ul id="toc">${[...sessions]
          .filter((s) => s.status === 1)
          .sort((a, b) => Number(b.date) - Number(a.date))
          .slice(0, 5)
          .map(
            (s) =>
              `<li><a href="#t${s.presentationId}">${new Date(s.date).toISOString().split("T")[0]}: ${s.location} | ${pres[s.presentationId]}</a></li>`,
          )
          .join("")}</ul>`
      : "",
  );

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
