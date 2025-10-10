import { Glob } from "bun";
import hljs from "highlight.js";
import { minify } from "minify";
import { db } from "./src/db";
import mainCSS from "./src/html/css/main.css" with { type: "text" };
import picoCSS from "./src/html/css/pico.min.css" with { type: "text" };
import createUserPage from "./src/services/createUserPage";

const css = picoCSS + mainCSS;
const hasher = new Bun.CryptoHasher("sha1");
hasher.update(css);
const sha = hasher.digest("hex");

const glob = new Glob("*.css");
for await (const file of glob.scanSync(`${process.cwd()}/public`)) {
  const f = Bun.file(`${process.cwd()}/public/${file}`);
  await f.delete();
}

await Bun.write(`${process.cwd()}/public/${sha}.css`, await minify.css(css));

const yml = `title: Your title
abstract: |
  Your abstract
url: https://www.host.tld/path/to/your/slides
sessions:
  - date: 2025-03-12
    location: A nice meetup
    link: https://www.your-event.tld/path/to/your/program
    slides: https://your.hosted.slides.tld
    video: https://www.your-video-provider.tld/path/to/your/video
    status: accepted | rejected | declined | pending
  - date: 2025-03-12
    location: Another nice meetup
    link: https://www.your-event.tld/path/to/your/program
    slides: https://your.hosted.slides.tld
    video: https://www.your-video-provider.tld/path/to/your/video`;

const json = `{
  "addScripts": [
    "plugins/YOUR_PLUGIN/YOUR_PLUGIN.js"
  ],
  "addStyles": [
    "plugins/YOUR_PLUGIN/YOUR_PLUGIN.css"
  ],
  "tags": ["YOUR_PLUGIN", "and", "others", "tags", "to", "find", "it"]
}`;

const hyml = hljs.highlight(yml, { language: "yaml" }).value;
const hjson = hljs.highlight(json, { language: "json" }).value;

const footerHTML = `
  <footer>
      <nav class="container">
          <ul>
              <li>slidesk<span>.link</span></li>
          </ul>
          <ul>
              <li>
                  <a
                      href="https://slidesk.github.io/slidesk-doc/"
                      target="_blank"
                      rel="noopener"
                  >
                      Documentation
                  </a>
              </li>
              <li>
                  <a
                      href="https://github.com/slidesk/slidesk.link"
                      target="_blank"
                      rel="noopener"
                  >
                      Source code
                  </a>
              </li>
              <li><a href="/mentions">Legal</a></li>
          </ul>
      </nav>
  </footer>
`;

for (const page of ["profile", "mentions", "search"]) {
  await Bun.write(
    `${process.cwd()}/dist-html/${page}.html`,
    await minify.html(
      (await Bun.file(`${process.cwd()}/src/html/${page}.html`).text())
        .replace(
          '<meta charset="utf-8" />',
          `<meta charset="utf-8" /><link rel="stylesheet" href="/public/${sha}.css" />`,
        )
        .replace("#FOOTER", footerHTML),
    ),
  );
}

await Bun.write(
  `${process.cwd()}/dist-html/index.html`,
  await minify.html(
    (await Bun.file(`${process.cwd()}/src/html/index.html`).text())
      .replace(
        '<meta charset="utf-8" />',
        `<meta charset="utf-8" /><link rel="stylesheet" href="/public/${sha}.css" />`,
      )
      .replace("#YML", hyml)
      .replace("#JSON", hjson)
      .replace("#FOOTER", footerHTML),
  ),
);

await Bun.write(
  `${process.cwd()}/dist-html/index-logged.html`,
  await minify.html(
    (await Bun.file(`${process.cwd()}/src/html/index.html`).text())
      .replace(
        '<meta charset="utf-8" />',
        `<meta charset="utf-8" /><link rel="stylesheet" href="/public/${sha}.css" />`,
      )
      .replace(
        '<a href="/login/">Login</a>',
        '<a href="/profile">Profile</a></li><li><a href="/exit">Logout</a>',
      )
      .replace("#YML", hyml)
      .replace("#JSON", hjson)
      .replace("#FOOTER", footerHTML),
  ),
);

const users = await db.user.findMany();
for await (const u of users) {
  console.log(u.slug);
  await createUserPage(u);
}
