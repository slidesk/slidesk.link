import { internalHeader } from "../components/header";
import { page } from "../components/layout";

export const itemPage = (type: string) =>
  page(
    { title: `SliDesk.link | ${type.charAt(0).toUpperCase()}${type.slice(1)}` },
    `${internalHeader()}
    <main class="container">
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

      window.addEventListener("DOMContentLoaded", async () => {
        const $results = document.querySelector("#results");
        const result = await fetch("/search/*/${type}", { method: "POST" });
        const { plugins, components, themes, templates } = await result.json();
        let html = "";

        const section = (items, icon, title, kind, installCmd) => {
          if (!items.length) return "";
          const cols = [[], []];
          items.forEach((item, i) => cols[i % 2].push(item));
          return \`
          <section>
            <h2>\${icon} \${title}</h2>
            <div class="addon-grid">
              <div class="col">\${cols[0].map(i => \`
                <article>
                  <header><h3>\${i.slug} <span class="download-badge" data-tooltip="\${i.downloaded} download(s)">\${i.downloaded}</span></h3></header>
                  <div>\${i.description}</div>
                  <footer>
                    <code>slidesk \${kind} install @\${i.user}/\${i.slug}</code>
                    <button class="copy-btn" data-cmd="slidesk \${installCmd} @\${i.user}/\${i.slug}" aria-label="copy command">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    </button>
                  </footer>
                </article>\`).join("")}</div>
              <div class="col">\${cols[1].map(i => \`
                <article>
                  <header><h3>\${i.slug} <span class="download-badge" data-tooltip="\${i.downloaded} download(s)">\${i.downloaded}</span></h3></header>
                  <div>\${i.description}</div>
                  <footer>
                    <code>slidesk \${kind} install @\${i.user}/\${i.slug}</code>
                    <button class="copy-btn" data-cmd="slidesk \${installCmd} @\${i.user}/\${i.slug}" aria-label="copy command">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    </button>
                  </footer>
                </article>\`).join("")}</div>
            </div>
          </section><hr/>\`;
        };

        html += section(plugins, '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2"/><rect x="14" y="2" width="8" height="8" rx="1"/></svg>', "Plugins", "plugin", "plugin");
        html += section(components, '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="12" x="3" y="8" rx="1"/><path d="M10 8V5c0-.6-.4-1-1-1H6a1 1 0 0 0-1 1v3"/><path d="M19 8V5c0-.6-.4-1-1-1h-3a1 1 0 0 0-1 1v3"/></svg>', "Components", "component", "component");
        html += section(themes, '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/></svg>', "Themes", "theme", "plugin theme");
        html += section(templates, '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>', "Templates", "template", "plugin template");

        if (html.trim() === "") html = "<mark>no result</mark>";
        else {
          $results.innerHTML = html;
          document.querySelectorAll(".copy-btn").forEach(el => {
            el.addEventListener("click", e => {
              e.preventDefault();
              const cmd = el.getAttribute("data-cmd");
              if (cmd) { navigator.clipboard.writeText(cmd); showToast("Command copied!"); }
            });
          });
        }
      });
    </script>`,
  );
