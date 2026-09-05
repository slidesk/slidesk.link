import hljs from "highlight.js/lib/common";

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

const unescapeHtml = (str: string) =>
  str.replace(
    /&(?:amp|lt|gt|quot|#39);/g,
    (entity) => HTML_ENTITIES[entity] ?? entity,
  );

/**
 * Parser options for every piece of user-authored content.
 *
 * `noHtmlBlocks` / `noHtmlSpans` escape raw HTML instead of emitting it — bios
 * and addon descriptions are untrusted, so tags must never reach the page as
 * markup. Email autolinks stay off: addon READMEs are full of `name@version`
 * strings, and linking those to `mailto:` is worse than asking for an explicit
 * `[label](mailto:…)`.
 */
const OPTIONS: Bun.markdown.Options = {
  autolinks: { url: true, www: true },
  noHtmlBlocks: true,
  noHtmlSpans: true,
};

// Matches the `<pre><code[ class="language-…"]>…</code></pre>` blocks that
// Bun.markdown.html emits. The body is entity-escaped, so it can never contain
// the closing sequence itself.
const CODE_BLOCK =
  /<pre><code(?: class="language-([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g;

/**
 * Re-emit each fenced block with highlight.js markup. Highlighting happens here
 * rather than in the browser: the client only ships the `.hljs-*` colors, and
 * the `<span>`s survive HtmlContent's DOMPurify pass.
 */
const highlight = (html: string) =>
  html.replace(CODE_BLOCK, (_match, lang: string | undefined, body: string) => {
    const code = unescapeHtml(body);
    // getLanguage resolves aliases too (sh, js, yml, …); unknown or missing
    // fences fall back to plain escaped text rather than a wrong grammar.
    const language = lang && hljs.getLanguage(lang) ? lang : null;
    const value = language
      ? hljs.highlight(code, { language, ignoreIllegals: true }).value
      : escapeHtml(code);
    return `<pre class="hljs"><code class="hljs language-${language ?? "plaintext"}">${value}</code></pre>`;
  });

/**
 * The single markdown renderer for every piece of user-authored content (bios,
 * abstracts, addon READMEs).
 */
export const render = (source: string | null | undefined) =>
  highlight(Bun.markdown.html(source ?? "", OPTIONS));

/** Demote h1-h3 to h4-h6 so user content never competes with page headings. */
export const demote = (html: string) =>
  html
    .replace(/<h1/g, "<h4")
    .replace(/<\/h1/g, "</h4")
    .replace(/<h2/g, "<h5")
    .replace(/<\/h2/g, "</h5")
    .replace(/<h3/g, "<h6")
    .replace(/<\/h3/g, "</h6");

export const renderDemoted = (source: string | null | undefined) =>
  demote(render(source));
