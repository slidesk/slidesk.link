import hljs from "highlight.js/lib/common";
import markdownIt from "markdown-it";

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * The single markdown renderer for every piece of user-authored content (bios,
 * abstracts, addon READMEs). Fenced code blocks are highlighted here rather
 * than in the browser: the client only ships the `.hljs-*` colors, and the
 * `<span>`s survive HtmlContent's DOMPurify pass.
 */
export const md = markdownIt({
  xhtmlOut: true,
  linkify: true,
  typographer: true,
  highlight: (code, lang) => {
    // getLanguage resolves aliases too (sh, js, yml, …); unknown or missing
    // fences fall back to plain escaped text rather than a wrong grammar.
    const language = lang && hljs.getLanguage(lang) ? lang : null;
    const value = language
      ? hljs.highlight(code, { language, ignoreIllegals: true }).value
      : escapeHtml(code);
    return `<pre class="hljs"><code class="hljs language-${language ?? "plaintext"}">${value}</code></pre>`;
  },
});

export const render = (source: string | null | undefined) =>
  md.render(source ?? "");

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
