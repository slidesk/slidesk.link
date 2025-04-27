import { Glob } from "bun";
import hljs from "highlight.js";
import { minify } from "minify";
import mainCSS from "./src/html/css/main.css" with { type: "text" };
import picoCSS from "./src/html/css/pico.min.css" with { type: "text" };

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
  - date: 2025-03-12
    location: Another nice meetup
    link: https://www.your-event.tld/path/to/your/program
    slides: https://your.hosted.slides.tld
    video: https://www.your-video-provider.tld/path/to/your/video`;

const hyml = hljs.highlight(yml, { language: "yaml" }).value;

await Bun.write(
  `${process.cwd()}/dist/index.html`,
  (
    await minify.html(
      await Bun.file(`${process.cwd()}/src/html/index.html`).text(),
    )
  )
    .replace(
      "<meta charset=utf-8>",
      `<meta charset=utf-8><link rel=stylesheet href=/public/${sha}.css>`,
    )
    .replace("#YML", hyml),
);

await Bun.write(
  `${process.cwd()}/dist/index-logged.html`,
  (
    await minify.html(
      await Bun.file(`${process.cwd()}/src/html/index.html`).text(),
    )
  )
    .replace(
      "<meta charset=utf-8>",
      `<meta charset=utf-8><link rel=stylesheet href=/public/${sha}.css>`,
    )
    .replace(
      "<a href=/login>Login</a>",
      "<a href=/profile>Profile</a></li><li><a href=/exit>Logout</a>",
    )
    .replace("#YML", hyml),
);

await Bun.write(
  `${process.cwd()}/dist/profile.html`,
  (
    await minify.html(
      await Bun.file(`${process.cwd()}/src/html/profile.html`).text(),
    )
  ).replace(
    "<meta charset=utf-8>",
    `<meta charset=utf-8><link rel=stylesheet href=/public/${sha}.css>`,
  ),
);

await Bun.write(
  `${process.cwd()}/dist/mentions.html`,
  (
    await minify.html(
      await Bun.file(`${process.cwd()}/src/html/mentions.html`).text(),
    )
  ).replace(
    "<meta charset=utf-8>",
    `<meta charset=utf-8><link rel=stylesheet href=/public/${sha}.css>`,
  ),
);
