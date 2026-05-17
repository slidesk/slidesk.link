import { footer } from "./footer";

const favicons = `
<link rel="icon" href="/public/slidesk.svg" type="image/svg+xml" />
<link rel="icon" href="/public/slidesk.ico" type="image/x-icon" />
<link rel="icon" href="/public/slidesk-32x32.png" type="image/png" sizes="32x32" />
<link rel="apple-touch-icon" href="/public/slidesk-180x180.png" type="image/png" sizes="180x180" />`;

export type PageMeta = {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  siteName?: string;
  extraHead?: string;
};

const ogTags = (meta: PageMeta) => {
  const tags = [
    meta.title ? `<meta property="og:title" content="${meta.title}" />` : "",
    meta.description
      ? `<meta property="og:description" content="${meta.description}" />`
      : "",
    meta.image ? `<meta property="og:image" content="${meta.image}" />` : "",
    meta.url ? `<meta property="og:url" content="${meta.url}" />` : "",
    meta.siteName
      ? `<meta property="og:site_name" content="${meta.siteName}" />`
      : "",
  ];
  return tags.join("\n    ");
};

export const page = (meta: PageMeta, body: string) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <title>${meta.title}</title>
    ${favicons}
    ${meta.description ? `<meta name="description" content="${meta.description}" />` : ""}
    ${ogTags(meta)}
    ${meta.extraHead ?? ""}
  </head>
  <body>
    ${body}
    ${footer}
  </body>
</html>`;
