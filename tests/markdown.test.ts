import { describe, expect, test } from "bun:test";
import { demote, render, renderDemoted } from "../src/services/markdown";

describe("render", () => {
  test("renders inline and block markdown", () => {
    expect(render("# Titre\n\nUn **gras** et de l'`inline`.")).toBe(
      "<h1>Titre</h1>\n<p>Un <strong>gras</strong> et de l'<code>inline</code>.</p>\n",
    );
  });

  test("treats null/undefined/empty as empty output", () => {
    expect(render(null)).toBe("");
    expect(render(undefined)).toBe("");
    expect(render("")).toBe("");
  });

  test("escapes raw HTML instead of emitting it", () => {
    expect(render("<script>alert(1)</script>")).toBe(
      "<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>\n",
    );
    expect(render("a <b>bold</b> span")).toBe(
      "<p>a &lt;b&gt;bold&lt;/b&gt; span</p>\n",
    );
    expect(render('<img src=x onerror="alert(1)">')).not.toContain("<img");
  });

  test("autolinks urls and www hosts", () => {
    expect(render("visit https://slidesk.link now")).toContain(
      '<a href="https://slidesk.link">https://slidesk.link</a>',
    );
    expect(render("visit www.slidesk.link now")).toContain(
      '<a href="http://www.slidesk.link">www.slidesk.link</a>',
    );
  });

  test("leaves name@version strings alone instead of linking them", () => {
    expect(render("Since slidesk@2.7.8")).toBe("<p>Since slidesk@2.7.8</p>\n");
    // an explicit mailto link still works
    expect(render("[Mail](mailto:a@b.fr)")).toContain('href="mailto:a@b.fr"');
  });

  test("highlights a fenced block with a known language", () => {
    const html = render('```js\nconst a = "<b>" & 1;\n```');
    expect(html).toStartWith(
      '<pre class="hljs"><code class="hljs language-js">',
    );
    expect(html).toContain('<span class="hljs-keyword">const</span>');
    // the code itself stays escaped
    expect(html).toContain("&quot;&lt;b&gt;&quot;");
  });

  test("falls back to escaped plaintext for unknown or missing languages", () => {
    for (const source of [
      "```\nfoo & <bar>\n```",
      "```nosuchlang\nfoo & <bar>\n```",
    ]) {
      const html = render(source);
      expect(html).toStartWith(
        '<pre class="hljs"><code class="hljs language-plaintext">',
      );
      expect(html).toContain("foo &amp; &lt;bar&gt;");
      expect(html).not.toContain("hljs-");
    }
  });

  test("resolves language aliases", () => {
    expect(render("```yml\nkey: value\n```")).toContain('language-yml"');
  });
});

describe("demote", () => {
  test("shifts h1-h3 down three levels and leaves the rest alone", () => {
    expect(demote("<h1>a</h1><h2>b</h2><h3>c</h3><h4>d</h4>")).toBe(
      "<h4>a</h4><h5>b</h5><h6>c</h6><h4>d</h4>",
    );
  });

  test("renderDemoted renders then demotes", () => {
    expect(renderDemoted("## Sous-titre")).toBe("<h5>Sous-titre</h5>\n");
  });
});
