import { Glob } from "bun";
import markdownIt from "markdown-it";
import { minify } from "minify";
import componentGetByUser from "../database/component/getByUser";
import pluginGetByUser from "../database/plugin/getByUser";
import presentationGetByUser from "../database/presentation/getByUser";
import { db } from "../db";
import userPage from "../html/user.html" with { type: "text" };
import type { SlideskLinkSession, SlideskLinkUser } from "../types";
import extractHeaderComment from "./extractHeaderComment";

const md = markdownIt({
  xhtmlOut: true,
  linkify: true,
  typographer: true,
});

export default async (u: SlideskLinkUser) => {
  let html = `${userPage}`
    .replaceAll("#NAME", u.name ?? "")
    .replaceAll("#SLUG", u.slug)
    .replaceAll("#AVATAR", u.avatarUrl ?? "");
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
  const presentations = (await presentationGetByUser(Number(u.id)))?.sort(
    (a, b) => (getLastDate(a.Session) > getLastDate(b.Session) ? -1 : 1),
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
        <header>
          <h3 id="t${p.id}">
              ${p.title}
          </h3>
        </header>
        <div>${md.render(p.abstract ?? "")}</div>
        <footer>
            ${p.Session.sort((a, b) => Number(b.date) - Number(a.date))
              .map(
                (s, _) => `
                <div style="${s.status === 0 ? "display: none" : ""}">
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

  //#TALKS
  if (talks.length)
    html = html.replaceAll(
      "#TALKS",
      `
    <section>
      <details open>
        <summary>
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-megaphone-icon lucide-megaphone"><path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"/><path d="M8 6v8"/></svg>
            Talks
          </h2>
        </summary>
        <p style="text-align: right">
          <button id="btn_viewrejecteds" onclick="window.viewRejecteds()">
              View rejected sessions
          </button>
        </p>
        ${talks.join("")}
      </details>
    </section><hr/>
  `,
    );
  else html = html.replaceAll("#TALKS", "");

  //#PLUGINS
  const plugins = (await pluginGetByUser(u.id as number)).toSorted((a, b) =>
    a.slug.localeCompare(b.slug),
  );
  if (plugins.length) {
    html = html.replace(
      "#PLUGINS",
      `
<section>
  <details open>
    <summary>
      <h2>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-blocks-icon lucide-blocks"><path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2"/><rect x="14" y="2" width="8" height="8" rx="1"/></svg>
        Plugins
      </h2>
    </summary>
    ${plugins
      .map(
        (plugin) => `
      <article>
        <header>
          <h3 id="p${plugin.slug}">
              ${plugin.slug}
              <small><code data-tooltip="${plugin.downloaded} download(s)">${plugin.downloaded}</code></small>
          </h3>
        </header>
        <div>${md
          .render(plugin.description ?? "")
          .replace("<h1", "<h4")
          .replace("</h1", "</h4")
          .replace("<h2", "<h5")
          .replace("</h2", "</h5")
          .replace("<h3", "<h6")
          .replace("</h3", "</h6")}</div>
        <footer>
          <code>slidesk plugin install @${u.slug}/${plugin.slug}</code>
          <a href="#" data-tooltip="copy command" onclick="navigator.clipboard.writeText('slidesk plugin install @${u.slug}/${plugin.slug}');return false;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy-icon lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </a>
        </footer>
      </article>`,
      )
      .join("")}
  </details>
</section><hr/>
    `,
    );
  } else html = html.replace("#PLUGINS", "");

  //#COMPONENTS
  const components = (await componentGetByUser(u.id as number)).toSorted(
    (a, b) => a.slug.localeCompare(b.slug),
  );
  if (components.length) {
    html = html.replace(
      "#COMPONENTS",
      `
<section>
  <details open>
    <summary>
      <h2>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-toy-brick-icon lucide-toy-brick"><rect width="18" height="12" x="3" y="8" rx="1"/><path d="M10 8V5c0-.6-.4-1-1-1H6a1 1 0 0 0-1 1v3"/><path d="M19 8V5c0-.6-.4-1-1-1h-3a1 1 0 0 0-1 1v3"/></svg>
        Components
      </h2>
    </summary>
    ${components
      .map(
        (component) => `
      <article>
        <header>
          <h3 id="c${component.slug}">
              ${component.slug}
              <small><code data-tooltip="${component.downloaded} download(s)">${component.downloaded}</code></small>
          </h3>
        </header>
        <div>${md
          .render(extractHeaderComment(component.description ?? ""))
          .replace("<h1", "<h4")
          .replace("</h1", "</h4")
          .replace("<h2", "<h5")
          .replace("</h2", "</h5")
          .replace("<h3", "<h6")
          .replace("</h3", "</h6")}</div>
        <footer>
          <code>slidesk component install @${u.slug}/${component.slug}</code>
          <a href="#" data-tooltip="copy command" onclick="navigator.clipboard.writeText('slidesk plugin component @${u.slug}/${component.slug}');return false;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy-icon lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </a>
        </footer>
      </article>`,
      )
      .join("")}
  </details>
</section><hr/>
    `,
    );
  } else html = html.replace("#COMPONENTS", "");

  //#THEMES
  //<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-palette-icon lucide-palette"><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/></svg>
  html = html.replace("#THEMES", "");

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
  await Bun.write(`${process.cwd()}/app/users/${u.slug}.html`, html);
  await db.user.update({
    data: { updatedAt: new Date() },
    where: { id: u.id },
  });
  return html;
};
