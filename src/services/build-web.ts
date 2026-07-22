import { Glob } from "bun";
import hljs from "highlight.js";
import { minify } from "minify";
import { db } from "../db";
import mainCSS from "../html/css/main.css" with { type: "text" };
import { homePage } from "../html/pages/home";
import { itemPage } from "../html/pages/item";
import { mentionsPage } from "../html/pages/mentions";
import { profilePage } from "../html/pages/profile";
import { searchPage } from "../html/pages/search";
import createUserPage from "./createUserPage";

export const buildWeb = async () => {
  const css = mainCSS;
  const hasher = new Bun.CryptoHasher("sha1");
  hasher.update(css);
  const sha = hasher.digest("hex");

  const glob = new Glob("*.css");
  for await (const file of glob.scanSync(`${process.cwd()}/dist-html`)) {
    const f = Bun.file(`${process.cwd()}/dist-html/${file}`);
    await f.delete();
  }

  await Bun.write(
    `${process.cwd()}/dist-html/${sha}.css`,
    await minify.css(css),
  );

  const cssPath = `/css/${sha}`;

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

  const injectCSS = (html: string) =>
    html.replace(
      "</head>",
      `<link rel="stylesheet" href="${cssPath}" /></head>`,
    );

  const pages: [string, string][] = [
    ["index", injectCSS(homePage(hyml, hjson, false))],
    ["index-logged", injectCSS(homePage(hyml, hjson, true))],
    ["mentions", injectCSS(mentionsPage())],
    ["profile", injectCSS(profilePage())],
    ["search", injectCSS(searchPage())],
    ["components", injectCSS(itemPage("components"))],
    ["plugins", injectCSS(itemPage("plugins"))],
    ["templates", injectCSS(itemPage("templates"))],
    ["themes", injectCSS(itemPage("themes"))],
  ];

  for (const [name, html] of pages) {
    await Bun.write(
      `${process.cwd()}/dist-html/${name}.html`,
      await minify.html(html),
    );
  }

  const users = await db.user.findMany();
  for await (const u of users) {
    await createUserPage(u);
  }
};
