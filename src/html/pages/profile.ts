import { page } from "../components/layout";
import { profileHeader } from "../components/header";

export const profilePage = () =>
  page(
    { title: "SliDesk.link | Profile" },
    `${profileHeader()}
    <main class="container">
      <article>
        <header><h2>Edit your profile</h2></header>
        <form method="post">
          <fieldset>
            <label>Name <input name="name" placeholder="Your name" autocomplete="name" aria-label="your name" required /></label>
          </fieldset>
          <fieldset>
            <label>Slug <input name="slug" placeholder="Your slug/login" autocomplete="nickname" aria-label="your nickname" required pattern="[A-z0-9\\-_]+" /></label>
          </fieldset>
          <fieldset>
            <label>Avatar URL <input name="avatarUrl" placeholder="Your avatar url" autocomplete="off" aria-label="url of your avatar" /></label>
          </fieldset>
          <fieldset>
            <label>URL <input name="url" placeholder="Your url" autocomplete="off" aria-label="url of your personal site" /></label>
          </fieldset>
          <fieldset>
            <label>Bio (markdown) <textarea name="bio" placeholder="Write a professional short bio..." aria-label="Professional short bio"></textarea></label>
          </fieldset>
          <input type="submit" value="Save changes" />
        </form>
      </article>
      <article>
        <header><h2>API Token</h2></header>
        <p>Token to paste in <code>~/.slidesk</code> if you can't use <code>slidesk link login</code>:</p>
        <pre id="token"></pre>
      </article>
      <article>
        <header><h2>Hosted</h2></header>
        <div id="hosted"></div>
      </article>
      <details><summary><h2>Presentations</h2></summary><div id="presentations"></div></details>
      <details><summary><h2>Plugins</h2></summary><div id="plugins"></div></details>
      <details><summary><h2>Components</h2></summary><div id="components"></div></details>
      <details><summary><h2>Templates</h2></summary><div id="templates"></div></details>
      <details><summary><h2>Themes</h2></summary><div id="themes"></div></details>
      <article style="border-color: rgba(239, 68, 68, 0.2);">
        <header><h2 style="color: #ef4444;">Danger zone</h2></header>
        <p>All your plugins, presentations, templates, components, themes, ... will be deleted.</p>
        <button onclick="window.deleteUser()" class="secondary" style="border-color: #ef4444; color: #ef4444;">Delete my account</button>
      </article>
    </main>
    <script>
      const autosize = () => {
        const resize = ($text) => { $text.style.height = "auto"; $text.style.height = $text.scrollHeight + "px"; };
        const $text = document.querySelector("textarea");
        $text.setAttribute("rows", 1);
        resize($text);
        $text.addEventListener("input", () => resize($text));
      };
      autosize();

      const iconStatus = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9.5 14.5 5-5"/><path d="m9.5 9.5 5 5"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9 12 2 2 4-4"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9.5 14.5 5-5"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M9 12h6"/></svg>',
      ];
      const textStatus = ["Rejected", "Accepted", "Declined", "Pending"];

      const renderTable = (items, idPrefix, cols) => items.length
        ? \`<table class="striped">\${items.map(i => \`<tr id="\${idPrefix}_\${i.id || i.slug}">\${cols(i)}</tr>\`).join("")}</table>\`
        : "No \${idPrefix} found";

      fetch("/profile/data?" + Date.now())
        .then(r => r.json())
        .then(data => {
          document.querySelector("#token").innerHTML = data.token;
          Object.entries(data.form).forEach(([k, v]) => { document.querySelector("[name='" + k + "']").value = v; });
          document.querySelector("#gotomypage").setAttribute("href", "/u/" + data.form.slug);
          autosize();

          if (data.presentations.length) {
            let nbOk = 0, nbTot = 0;
            data.presentations.forEach(p => {
              nbTot += p.Session.length;
              nbOk += p.Session.reduce((a, s) => a + (s.status !== 0 && s.status !== 3 ? 1 : 0), 0);
            });
            document.querySelector("#presentations").innerHTML =
              \`<h3 class="align-right">\${nbOk} / \${nbTot} => \${(nbOk / nbTot * 100).toFixed(2)}%</h3>\` +
              data.presentations.map(p => \`
                <article id="p_\${p.id}">
                  <header>\${p.title}</header>
                  <main><blockquote>\${p.abstract}</blockquote>
                    <table class="striped">
                      \${[...p.Session].sort((a,b) => Number(a.date) - Number(b.date)).map(s => \`
                        <tr id="s_\${s.id}">
                          <td><span class="icon-status status-\${s.status}" data-tooltip="\${textStatus[s.status]}">\${iconStatus[s.status]}</span>\${new Date(s.date).toISOString().split("T")[0]}: \${s.location}</td>
                          <td class="align-right"><button class="secondary" onclick="window.removeItem('session', 's', '\${s.id}')">Delete</button></td>
                        </tr>\`).join("")}
                    </table>
                  </main>
                  <footer>\${p.Session.reduce((a, s) => a + (s.status !== 0 && s.status !== 3 ? 1 : 0), 0)}/\${p.Session.length} = \${(100 * p.Session.reduce((a, s) => a + (s.status !== 0 && s.status !== 3 ? 1 : 0), 0) / p.Session.length).toFixed(2)}%
                    <button class="secondary" onclick="window.removeItem('presentation', 'p', '\${p.id}')">Delete</button>
                  </footer>
                </article>\`).join("");
          }

          document.querySelector("#hosted").innerHTML = data.hosted.length
            ? \`<table class="striped">\${data.hosted.map(h => \`
                <tr id="h_\${h.id}">
                  <td><a href="https://slidesk.link/s/\${h.id}/" target="_blank">\${h.id}</a></td>
                  <td><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> \${new Date(h.createdAt).toISOString()}</td>
                  <td><button class="secondary" onclick="window.removeItem('hosted', 'h', '\${h.id}')">Delete</button></td>
                </tr>\`).join("")}</table>\`
            : "No hosted found";

          ["plugins","components","templates","themes"].forEach(kind => {
            const slug = { plugins: "pl", components: "c", templates: "tpl", themes: "t" }[kind];
            document.querySelector("#" + kind).innerHTML = data[kind].length
              ? \`<table class="striped">\${data[kind].map(i => \`
                  <tr id="\${slug}_\${i.slug}">
                    <td>\${i.slug}</td>
                    <td><button class="secondary" onclick="window.removeItem('\${kind.slice(0,-1)}', '\${slug}', '\${i.slug}')">Delete</button></td>
                  </tr>\`).join("")}</table>\`
              : "No " + kind + " found";
          });
        });

      window.removeItem = async (type, slug, id) => {
        await fetch("/profile/" + type + "/" + id, { method: "DELETE" });
        document.querySelector("#" + slug + "_" + id).remove();
      };

      window.deleteUser = async () => {
        if (confirm("Are you sure?")) {
          for (const { type, slug } of [{ type: "session", slug: "s" }, { type: "presentation", slug: "p" }, { type: "hosted", slug: "h" }, { type: "plugin", slug: "pl" }, { type: "component", slug: "c" }, { type: "template", slug: "tpl" }, { type: "theme", slug: "t" }]) {
            for (const el of [...document.querySelectorAll("[id^='" + slug + "_']")]) {
              await window.removeItem(type, slug, el.id.replace(slug + "_", ""));
            }
          }
          await fetch("/profile/user", { method: "DELETE" });
          window.location = "/exit";
        }
      };
    </script>`,
  );
