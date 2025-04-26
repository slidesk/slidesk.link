import { minify } from "minify";
import picoCSS from "./src/html/css/pico.min.css" with { type: "text" };
import mainCSS from "./src/html/css/main.css" with { type: "text" };
import { Glob } from "bun";

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

await Bun.write(
  `${process.cwd()}/dist/index.html`,
  (
    await minify.html(
      await Bun.file(`${process.cwd()}/src/html/index.html`).text(),
    )
  ).replace(
    "<meta charset=utf-8>",
    `<meta charset=utf-8><link rel=stylesheet href=/public/${sha}.css>`,
  ),
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
    ),
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
