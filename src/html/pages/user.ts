import { userHeader } from "../components/header";
import { type PageMeta, page } from "../components/layout";

const iconStatus = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9.5 14.5 5-5"/><path d="m9.5 9.5 5 5"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9.5 14.5 5-5"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M9 12h6"/></svg>`,
];
const textStatus = ["Rejected", "Accepted", "Declined", "Pending"];
const badgeClass = ["rejected", "accepted", "declined", "pending"];

const iconCalendar = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>`;
const iconLink = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
const iconSlide = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/></svg>`;
const iconVideo = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>`;

const iconPlugins = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2"/><rect x="14" y="2" width="8" height="8" rx="1"/></svg>`;
const iconComponents = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="12" x="3" y="8" rx="1"/><path d="M10 8V5c0-.6-.4-1-1-1H6a1 1 0 0 0-1 1v3"/><path d="M19 8V5c0-.6-.4-1-1-1h-3a1 1 0 0 0-1 1v3"/></svg>`;
const iconThemes = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/></svg>`;
const iconTemplates = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`;

const iconCalendarBig = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`;

type AddonItem = {
  slug: string;
  downloaded: number;
  description: string;
};

type Session = {
  date: Date;
  location: string;
  url: string | null;
  slides: string | null;
  video: string | null;
  status: number;
  presentationId: number;
};

type UserPageData = {
  name: string;
  slug: string;
  avatarUrl: string | null;
  bio: string | null;
  bioHtml: string;
  url: string | null;
  talks: {
    id: number;
    title: string;
    abstractHtml: string;
    sessions: Session[];
  }[];
  plugins: AddonItem[];
  components: AddonItem[];
  themes: AddonItem[];
  templates: AddonItem[];
};

const cardHtml = (item: AddonItem, slug: string, command: string) =>
  `<article class="addon-card" id="${slug}__${item.slug}">
    <div class="addon-card-body">
      <h3 class="addon-card-title">
        <a href="#${slug}__${item.slug}" class="copy-link-btn" data-tooltip="copy link to">#</a>
        <span>${item.slug}</span>
        <span class="download-badge" data-tooltip="${item.downloaded} download(s)">${item.downloaded}</span>
      </h3>
      <div class="addon-card-desc">${item.description}</div>
    </div>
    <div class="addon-card-actions">
      <code>slidesk ${command} install @${slug}/${item.slug}</code>
      <button class="copy-btn" data-cmd="slidesk ${command} install @${slug}/${item.slug}" aria-label="copy command">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      </button>
    </div>
  </article>`;

const addonSection = (
  title: string,
  icon: string,
  command: string,
  items: AddonItem[],
  slug: string,
) => {
  if (!items.length) return "";
  return `<section class="addons-section">
  <h2 class="addons-title">${icon} ${title}</h2>
  ${items.map((item) => cardHtml(item, slug, command)).join("")}
</section>`;
};

const sessionRowHtml = (s: Session, talkTitle: string, showRejected: boolean) =>
  `<div class="session-row" style="${s.status === 0 && !showRejected ? "display:none" : ""}">
    <span class="session-status status-${badgeClass[s.status]}" data-tooltip="${textStatus[s.status]}">
      ${iconStatus[s.status]}
      <span class="session-status-label">${textStatus[s.status]}</span>
    </span>
    <span class="session-info">
      ${iconCalendar} ${new Date(s.date).toISOString().split("T")[0]} &middot; ${s.location}
      ${talkTitle ? `<span class="session-talk-title">${talkTitle}</span>` : ""}
    </span>
    <span class="session-links">
      ${s.url ? `<a href="${s.url}" data-tooltip="More info" target="_blank" rel="noopener">${iconLink}</a>` : ""}
      ${s.slides ? `<a href="${s.slides}" data-tooltip="See presentation" target="_blank" rel="noopener">${iconSlide}</a>` : ""}
      ${s.video ? `<a href="${s.video}" data-tooltip="See video" target="_blank" rel="noopener">${iconVideo}</a>` : ""}
    </span>
  </div>`;

export const userPageHtml = (data: UserPageData) => {
  const meta: PageMeta = {
    title: `SliDesk.link | ${data.name}`,
    description: data.bio ?? undefined,
    image: data.avatarUrl ?? undefined,
    url: `https://slidesk.link/u/${data.slug}/`,
    siteName: "Slidesk.link",
  };

  const recentSessions = data.talks
    .flatMap((t) => t.sessions)
    .filter((s) => s.status === 1)
    .sort((a, b) => Number(b.date) - Number(a.date))
    .slice(0, 5);

  const toc = recentSessions.length
    ? `<div class="recent-cards">${recentSessions
        .map((s) => {
          const talk = data.talks.find((t) => t.sessions.includes(s));
          const dateStr = new Date(s.date).toISOString().split("T")[0];
          return `<a href="#t${s.presentationId}" class="recent-card">
            <span class="recent-card-date">${dateStr}</span>
            <span class="recent-card-body">
              <span class="recent-card-location">${s.location}</span>
              <span class="recent-card-title">${talk?.title ?? ""}</span>
            </span>
          </a>`;
        })
        .join("")}</div>`
    : "";

  const sessionStats = (() => {
    let total = 0,
      accepted = 0;
    for (const t of data.talks) {
      for (const s of t.sessions) {
        total++;
        if (s.status === 1) accepted++;
      }
    }
    return { total, accepted };
  })();

  const calendarData = (() => {
    const all: { date: string; talkTitle: string; session: Session }[] = [];
    for (const t of data.talks) {
      for (const s of t.sessions) {
        all.push({
          date: new Date(s.date).toISOString().split("T")[0],
          talkTitle: t.title,
          session: s,
        });
      }
    }
    all.sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        Number(b.session.date) - Number(a.session.date),
    );
    const groups: {
      date: string;
      items: { talkTitle: string; session: Session }[];
    }[] = [];
    for (const item of all) {
      const last = groups[groups.length - 1];
      if (last && last.date === item.date) {
        last.items.push({ talkTitle: item.talkTitle, session: item.session });
      } else {
        groups.push({
          date: item.date,
          items: [{ talkTitle: item.talkTitle, session: item.session }],
        });
      }
    }
    return groups.filter((g) =>
      g.items.some((item) => item.session.status !== 0),
    );
  })();

  const calendarHtml = calendarData.length
    ? `<div class="calendar-view">${calendarData
        .map(
          (g) => `<div class="cal-day">
        <div class="cal-day-header">
          ${iconCalendarBig}
          <span>${g.date}</span>
          <span class="cal-day-count">${g.items.length} session${g.items.length > 1 ? "s" : ""}</span>
        </div>
        <div class="cal-day-sessions">${g.items
          .map(
            (
              item,
            ) => `<div class="cal-session${item.session.status === 0 ? " cal-session-hidden" : ""}">
          <div class="cal-session-top">
            <span class="session-status status-${badgeClass[item.session.status]}">${iconStatus[item.session.status]} ${textStatus[item.session.status]}</span>
            <span class="cal-session-talk">${item.talkTitle}</span>
          </div>
          <div class="cal-session-bottom">
            <span class="cal-session-location">${item.session.location}</span>
            <span class="session-links">
              ${item.session.url ? `<a href="${item.session.url}" data-tooltip="More info" target="_blank" rel="noopener">${iconLink}</a>` : ""}
              ${item.session.slides ? `<a href="${item.session.slides}" data-tooltip="See presentation" target="_blank" rel="noopener">${iconSlide}</a>` : ""}
              ${item.session.video ? `<a href="${item.session.video}" data-tooltip="See video" target="_blank" rel="noopener">${iconVideo}</a>` : ""}
            </span>
          </div>
        </div>`,
          )
          .join("")}</div>
      </div>`,
        )
        .join("")}</div>`
    : "";

  const talksHtml = data.talks.length
    ? `<section class="talks-section">
    <div class="talks-header">
      <h2><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"/><path d="M8 6v8"/></svg> Talks</h2>
      <div class="talks-meta">
        <span class="session-count">${sessionStats.accepted}/${sessionStats.total} accepted</span>
        <div class="talks-toggle-group">
          <button id="btn_viewrejecteds" class="ghost-btn" onclick="window.viewRejecteds()">Show rejected</button>
          <button id="btn_togglecalendar" class="ghost-btn" onclick="window.toggleCalendar()">Calendar view</button>
        </div>
      </div>
    </div>
    <div id="talksListView" class="talks-list">
      ${data.talks
        .map(
          (t) => `<article class="talk-card" id="t${t.id}">
        <div class="talk-card-header">
          <h3>${t.title} <a href="#t${t.id}" class="anchor-link" data-tooltip="copy link to">#</a></h3>
        </div>
        <div class="talk-card-body">${t.abstractHtml}</div>
        <div class="talk-card-sessions">
          ${[...t.sessions]
            .sort((a, b) => Number(b.date) - Number(a.date))
            .map((s) => sessionRowHtml(s, "", false))
            .join("")}
        </div>
      </article>`,
        )
        .join("")}
    </div>
    <div id="talksCalendarView" class="talks-calendar" style="display:none">
      ${calendarHtml}
    </div>
  </section>`
    : "";

  const body = `${userHeader()}
      <main class="container profile-content">
      <section class="profile-hero">
        <div class="profile-hero-bg"></div>
        <div class="profile-hero-main">
          <div class="profile-hero-info">
            <h1>${data.name}</h1>
            <p class="profile-hero-slug">${data.slug}</p>
            ${data.bioHtml ? `<blockquote class="profile-hero-bio">${data.bioHtml}</blockquote>` : ""}
            ${data.url ? `<a href="${data.url}" class="profile-hero-url" target="_blank" rel="noopener">${iconLink} ${data.url}</a>` : ""}
          </div>
          <aside class="profile-hero-aside">
            ${data.avatarUrl ? `<div class="profile-avatar-wrapper"><img src="${data.avatarUrl}" alt="photo de ${data.slug}" width="256" height="256" /></div>` : ""}
            ${toc ? `<div class="profile-recent-talks"><span class="recent-label">Recent talks</span>${toc}</div>` : ""}
          </aside>
        </div>
      </section>
      ${talksHtml}
      ${addonSection("Plugins", iconPlugins, "plugin", data.plugins, data.slug)}
      ${addonSection("Components", iconComponents, "component", data.components, data.slug)}
      ${addonSection("Themes", iconThemes, "theme", data.themes, data.slug)}
      ${addonSection("Templates", iconTemplates, "template", data.templates, data.slug)}
    </main>
    <div class="pdf-overlay" id="pdfOverlay">
      <div class="pdf-popover">
        <div class="pdf-header">
          <div class="pdf-title" id="pdfTitle"></div>
          <button class="pdf-close" id="closeBtn" aria-label="Fermer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="pdf-viewer" id="pdfViewer"><progress /></div>
        <div class="pdf-controls">
          <div class="pdf-nav">
            <button class="pdf-btn" id="prevBtn" aria-label="previous">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 9a1 1 0 0 1-1-1V5.061a1 1 0 0 0-1.811-.75l-6.835 6.836a1.207 1.207 0 0 0 0 1.707l6.835 6.835a1 1 0 0 0 1.811-.75V16a1 1 0 0 1 1-1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z"/></svg>
            </button>
            <span class="pdf-page-info">Page <span id="currentPage">1</span> / <span id="totalPages">1</span></span>
            <button class="pdf-btn" id="nextBtn" aria-label="next">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 9a1 1 0 0 0 1-1V5.061a1 1 0 0 1 1.811-.75l6.836 6.836a1.207 1.207 0 0 1 0 1.707l-6.836 6.835a1 1 0 0 1-1.811-.75V16a1 1 0 0 0-1-1H5a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z"/></svg>
            </button>
          </div>
          <div class="pdf-zoom">
            <button class="pdf-btn" id="zoomOut" aria-label="zoom out"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg></button>
            <span class="pdf-page-info"><span id="zoomLevel">100</span>%</span>
            <button class="pdf-btn" id="zoomIn" aria-label="zoom in"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg></button>
          </div>
        </div>
      </div>
    </div>
    <script>
      window.viewRejecteds = () => {
        document.getElementById("btn_viewrejecteds").style.display = "none";
        document.querySelectorAll(".status-rejected").forEach(el => { el.parentElement.style.display = "flex"; });
        document.querySelectorAll(".cal-session-hidden").forEach(el => { el.style.display = "block"; });
      };
      window.toggleCalendar = () => {
        const listView = document.getElementById("talksListView");
        const calView = document.getElementById("talksCalendarView");
        const btn = document.getElementById("btn_togglecalendar");
        const isCal = calView.style.display !== "none";
        listView.style.display = isCal ? "block" : "none";
        calView.style.display = isCal ? "none" : "block";
        btn.textContent = isCal ? "Calendar view" : "List view";
      };
      window.addEventListener("load", () => {
        document.querySelectorAll(".anchor-link").forEach(el => {
          el.addEventListener("click", e => { e.preventDefault(); navigator.clipboard.writeText(el.href); showToast("Link copied!"); });
        });
        document.querySelectorAll(".copy-btn").forEach(el => {
          el.addEventListener("click", e => {
            e.preventDefault();
            const cmd = el.getAttribute("data-cmd");
            if (cmd) { navigator.clipboard.writeText(cmd); showToast("Command copied!"); }
          });
        });
        document.querySelectorAll(".addon-card").forEach(el => {
          el.addEventListener("click", e => {
            if (e.target.closest("a") || e.target.closest("button")) return;
            const cmd = el.querySelector(".copy-btn")?.getAttribute("data-cmd");
            if (cmd) { navigator.clipboard.writeText(cmd); showToast("Command copied!"); }
          });
        });
      });
      const showToast = (msg) => {
        const t = document.createElement("div");
        t.textContent = msg;
        Object.assign(t.style, {
          position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.85)", color: "#fff", padding: "0.75rem 1.5rem",
          borderRadius: "12px", fontSize: "0.9rem", zIndex: "9999",
          backdropFilter: "blur(12px)", animation: "slideUp 0.2s ease"
        });
        document.body.appendChild(t);
        setTimeout(() => { t.style.opacity = "0"; t.style.transition = "opacity 0.3s"; setTimeout(() => t.remove(), 300); }, 2000);
      };
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" type="module"></script>
    <script type="module">
      const { pdfjsLib } = globalThis;
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      let pdfDoc = null, currentPage = 1, scale = 1.5;
      const overlay = document.getElementById("pdfOverlay"), viewer = document.getElementById("pdfViewer"), title = document.getElementById("pdfTitle");
      function initPDFLinks() { document.querySelectorAll('a[href$=".pdf"]').forEach(link => { link.addEventListener("click", e => { const clickX = e.clientX - e.target.getBoundingClientRect().left; if (clickX > e.target.getBoundingClientRect().width - 30) { e.preventDefault(); openPDFPreview(link.href, link.textContent); } }); }); }
      async function openPDFPreview(url, fileName) {
        overlay.classList.add("active"); title.textContent = fileName || "Document PDF"; viewer.innerHTML = "<progress />"; currentPage = 1;
        try {
          pdfDoc = await pdfjsLib.getDocument({ url: "/api/proxy-pdf?url=" + encodeURIComponent(url), withCredentials: false }).promise;
          document.getElementById("totalPages").textContent = pdfDoc.numPages; renderPage(currentPage); updateButtons();
        } catch (error) {
          viewer.innerHTML = \`<div class="error"><p>Error while loading pdf</p><p style="font-size:12px;margin-top:10px"><a href="\${url}" target="_blank" style="color:#e74c3c;text-decoration:underline">Open in new tab</a></p></div>\`;
        }
      }
      async function renderPage(pageNum) {
        const page = await pdfDoc.getPage(pageNum), viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.height = viewport.height; canvas.width = viewport.width;
        viewer.innerHTML = ""; const container = document.createElement("div"); container.className = "pdf-canvas-container"; container.appendChild(canvas); viewer.appendChild(container);
        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
        document.getElementById("currentPage").textContent = pageNum; updateZoomDisplay();
      }
      function updateButtons() { document.getElementById("prevBtn").disabled = currentPage <= 1; document.getElementById("nextBtn").disabled = currentPage >= pdfDoc.numPages; }
      function updateZoomDisplay() { document.getElementById("zoomLevel").textContent = Math.round(scale * 100 / 1.5); }
      document.getElementById("closeBtn").addEventListener("click", () => { overlay.classList.remove("active"); pdfDoc = null; });
      overlay.addEventListener("click", e => { if (e.target === overlay) { overlay.classList.remove("active"); pdfDoc = null; } });
      document.getElementById("prevBtn").addEventListener("click", () => { if (currentPage > 1) { currentPage--; renderPage(currentPage); updateButtons(); } });
      document.getElementById("nextBtn").addEventListener("click", () => { if (currentPage < pdfDoc.numPages) { currentPage++; renderPage(currentPage); updateButtons(); } });
      document.getElementById("zoomIn").addEventListener("click", () => { scale = Math.min(scale + 0.25, 3); renderPage(currentPage); });
      document.getElementById("zoomOut").addEventListener("click", () => { scale = Math.max(scale - 0.25, 0.5); renderPage(currentPage); });
      document.addEventListener("keydown", e => {
        if (!overlay.classList.contains("active")) return;
        if (e.key === "Escape") { overlay.classList.remove("active"); pdfDoc = null; }
        else if (e.key === "ArrowLeft" && currentPage > 1) document.getElementById("prevBtn").click();
        else if (e.key === "ArrowRight" && currentPage < pdfDoc.numPages) document.getElementById("nextBtn").click();
      });
      initPDFLinks();
    </script>`;

  return page(meta, body);
};

export { iconLink, iconSlide, iconVideo };
