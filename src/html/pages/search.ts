import { internalHeader } from "../components/header";
import { page } from "../components/layout";

export const searchPage = () =>
  page(
    { title: "SliDesk.link | Search" },
    `${internalHeader()}
    <main class="container">
      <style>
        main.container > form > article { padding: 1rem 1.5rem; }
        main.container > form > article > header { padding-left: 0; padding-right: 0; }
      </style>
      <form>
        <article>
          <header><h2>Search the Hub</h2></header>
          <p>Plugins, components, users, talks, themes, templates — everything is searchable.</p>
          <fieldset>
            <input type="text" id="search_text" placeholder="Type your search..." />
          </fieldset>
          <fieldset>
            <legend>Search in:</legend>
            <div id="checkboxes">
              <label htmlFor="users"><input type="checkbox" value="users" id="users" name="filter" checked /> Users</label>
              <label htmlFor="talks"><input type="checkbox" value="talks" id="talks" name="filter" checked /> Talks</label>
              <label htmlFor="plugins"><input type="checkbox" value="plugins" id="plugins" name="filter" checked /> Plugins</label>
              <label htmlFor="components"><input type="checkbox" value="components" id="components" name="filter" checked /> Components</label>
              <label htmlFor="themes"><input type="checkbox" value="themes" id="themes" name="filter" checked /> Themes</label>
              <label htmlFor="templates"><input type="checkbox" value="templates" id="templates" name="filter" checked /> Templates</label>
            </div>
          </fieldset>
        </article>
      </form>
      <div id="results"></div>
    </main>
    <script>
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

      document.querySelector("form").addEventListener("input", async (e) => {
        const $results = document.querySelector("#results");
        const searchText = document.querySelector("#search_text").value;
        $results.innerHTML = "";
        if (searchText.length >= 3) {
          const { plugins, components, users, talks, themes, templates } = await (
            await fetch("/search/" + searchText + "/" + [...document.querySelectorAll('input[name="filter"]:checked')].map(e => e.value).join(","), { method: "POST" })
          ).json();

          const iconCalendar = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>';
          const iconLink = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
          const iconSlide = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/></svg>';
          const iconVideo = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>';

          let html = "#USERS #TALKS #PLUGINS #COMPONENTS #THEMES #TEMPLATES";

          const section = (items, icon, title, fn) => {
            if (!items.length) return;
            const isAddon = fn !== "USERS" && fn !== "TALKS";
            if (isAddon) {
              html = html.replace("#" + fn, \`
                <section>
                  <h2>\${icon} \${title}</h2>
                  <div class="addon-grid">\${items.map(i => \`
                    <article id="\${i.user}__\${i.slug}">
                      <header><a href="/\${fn.toLowerCase()}/" class="copy-link-btn" data-tooltip="copy link to">#</a><h3>\${i.slug} <span class="download-badge" data-tooltip="\${i.downloaded} download(s)">\${i.downloaded}</span></h3></header>
                      <div>\${i.description}</div>
                      <footer>
                        <code>slidesk \${fn.toLowerCase().slice(0,-1)} install @\${i.user}/\${i.slug}</code>
                        <button class="copy-btn" data-cmd="slidesk \${fn === "THEMES" ? "plugin theme" : fn.toLowerCase().slice(0,-1)} install @\${i.user}/\${i.slug}" aria-label="copy command">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        </button>
                      </footer>
                    </article>\`).join("")}</div>
                </section>\`);
            } else {
              html = html.replace("#" + fn, \`
                <section>
                  <details open>
                    <summary><h2>\${icon} \${title}</h2></summary>
                  \${items.map(i => fn === "USERS" ? \`
                    <article>
                      <header><h3>\${i.name} (\${i.slug})</h3></header>
                      <div>\${i.bio}</div>
                      <footer><a href="https://slidesk.link/u/\${i.slug}" target="_blank">https://slidesk.link/u/\${i.slug}</a></footer>
                    </article>\` : \`
                    <article>
                      <header><h3>\${i.title}</h3></header>
                      <div>\${i.abstract}</div>
                      <footer><div class="talk-sessions">\${i.sessions.sort((a,b) => Number(b.date) - Number(a.date)).map(s => \`
                        <div class="session-row">
                          <span class="session-status status-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9 12 2 2 4-4"/></svg></span>
                          <span class="session-info">\${iconCalendar} \${new Date(s.date).toISOString().split("T")[0]}: \${s.location}</span>
                          <span class="session-links">
                            \${s.url ? \`<a href="\${s.url}" data-tooltip="More info" target="_blank" rel="noopener">\${iconLink}</a>\` : ""}
                            \${s.slides ? \`<a href="\${s.slides}" data-tooltip="See presentation" target="_blank" rel="noopener">\${iconSlide}</a>\` : ""}
                            \${s.video ? \`<a href="\${s.video}" data-tooltip="See video" target="_blank" rel="noopener">\${iconVideo}</a>\` : ""}
                          </span>
                        </div>\`).join("")}</div></footer>
                    </article>\`).join("")}
                </details>
              </section><hr/>\`);
          }};

          section(plugins, '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2"/><rect x="14" y="2" width="8" height="8" rx="1"/></svg>', "Plugins", "PLUGINS");
          section(components, '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="12" x="3" y="8" rx="1"/><path d="M10 8V5c0-.6-.4-1-1-1H6a1 1 0 0 0-1 1v3"/><path d="M19 8V5c0-.6-.4-1-1-1h-3a1 1 0 0 0-1 1v3"/></svg>', "Components", "COMPONENTS");
          section(users, '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>', "Users", "USERS");
          section(talks, '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"/><path d="M8 6v8"/></svg>', "Talks", "TALKS");
          section(themes, '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/></svg>', "Themes", "THEMES");
          section(templates, '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>', "Templates", "TEMPLATES");

          html = html.replace(/#\\w+/g, "").trim();
          if (html === "") html = "<mark>no result</mark>";
          else {
            $results.innerHTML = html;
            document.querySelectorAll(".copy-btn").forEach(el => {
              el.addEventListener("click", e => {
                e.preventDefault();
                const cmd = el.getAttribute("data-cmd");
                if (cmd) { navigator.clipboard.writeText(cmd); showToast("Command copied!"); }
              });
            });
            document.querySelectorAll(".copy-link-btn").forEach(el => {
              el.addEventListener("click", e => {
                e.preventDefault();
                const id = el.closest("article").id;
                navigator.clipboard.writeText(location.origin + el.getAttribute("href") + "#" + id);
                showToast("Link copied!");
              });
            });
            if (location.hash) {
              const target = document.getElementById(location.hash.slice(1));
              if (target) target.scrollIntoView({ behavior: "smooth" });
            }
          }
        }
      });
    </script>`,
  );
