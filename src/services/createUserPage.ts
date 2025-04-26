import markdownIt from "markdown-it";
import { minify } from "minify";
import type { SlideskLinkUser } from "../types";
import userPage from "../html/user.html" with { type: "text" };
import { Glob } from "bun";

const md = markdownIt({
  xhtmlOut: true,
  linkify: true,
  typographer: true,
});

export default async (u: SlideskLinkUser) => {
  let html = userPage
    .replaceAll("#NAME", u.name)
    .replaceAll("#SLUG", u.slug)
    .replaceAll("#AVATAR", u.avatarUrl)
    .replaceAll("#TOC", "")
    .replaceAll("#TALKS", "");
  if (u.bio) html = html.replaceAll("#BIO", md.render(u.bio));
  else html = html.replaceAll("#BIO", "");
  if (u.url)
    html = html.replaceAll(
      "#URL",
      `<a href="${u.url}" target="_blank" rel="noopener"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link-icon lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>${u.url}</a>`,
    );
  else html = html.replaceAll("#URL", "");
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
  return html;
};

/*#TOC
<nav>
    <ul>
        <li>
            <a href=""#">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash-icon lucide-hash"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>
                Quand le Terminal dévore la UI : TUI pour tout le monde !
            </a>
        </li>
    </ul>
</nav>
*/

/*#TALKS
<section>
    <h2>Talks</h2>

    <article>
        <details>
            <summary>
                <h3>
                    Quand le Terminal dévore la UI : TUI pour tout le
                    monde !
                </h3>
            </summary>
            <blockquote>
                <p>
                    Lassé·es des interfaces graphiques gourmandes en
                    ressources et complexes à utiliser ? Vous n’avez pas
                    de temps à perdre entre votre terminal et un
                    navigateur web ? Découvrez le pouvoir de l’interface
                    utilisateur textuelle (Textual User Interface) !
                </p>
                <p>
                    Nous explorerons l’univers des TUI et leur potentiel
                    pour enrichir les applications en ligne de commande.
                    En partant d’une CLI simple, je vous montrerai
                    comment intégrer des éléments de TUI pour créer une
                    expérience utilisateur plus intuitive et
                    interactive.
                </p>
                <p>
                    Je vous proposerai un aperçu de quelques frameworks
                    TUI populaires tels que Textual, BubbleTea et
                    Ratatui, respectivement pour les langages Python,
                    Golang et Rust. Que vous ayez une grande maîtrise du
                    développement ou que vous soyez novice, ce talk vous
                    montrera comment ces frameworks pourront vous aider
                    à créer des interfaces utilisateur textuelles de
                    nouvelle génération.
                </p>
                <p>Vous repartirez donc :</p>
                <p>en sachant ce que les TUI peuvent vous apporter</p>
                <p>
                    avec un tour d'horizon de solutions pour en
                    développer vous même
                </p>
                <p>avec des exemples concrets de code</p>
                <p>
                    Et n’oubliez pas : ne quittez plus le confort de
                    votre terminal quand les TUI sont là pour vous !
                </p>
            </blockquote>
        </details>
        <footer>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-days-icon lucide-calendar-days"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
            <a href="https://gouz.dev">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-presentation-icon lucide-presentation"><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/></svg>
                See presentation
            </a>
            <a href="https://gouz.dev">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clapperboard-icon lucide-clapperboard"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>
                See record
            </a>
        </footer>
    </article>
</section>
*/
