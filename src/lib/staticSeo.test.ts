import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";
import { STATIC_SEO, htmlForRoute } from "./staticSeo";

// The real file, not a fixture: what this guards is index.html being edited
// in a way the build can no longer stamp.
const shell = readFileSync("index.html", "utf8");

describe("htmlForRoute", () => {
  it.each(Object.entries(STATIC_SEO))("gives %s its own head", (path, seo) => {
    const html = htmlForRoute(shell, path, seo);

    expect(html).toContain(`<title>${seo.title}</title>`);
    expect(html).toContain(`<link rel="canonical" href="https://milkmenot.com${path}" />`);
    expect(html).toContain(`<meta property="og:url" content="https://milkmenot.com${path}" />`);
    expect(html).not.toContain("Milk Me Not — Plant-based milk ratings");
    expect(html.match(/<link rel="canonical" href=/g)).toHaveLength(1);
  });

  it("changes nothing outside the head", () => {
    const body = (html: string) => html.slice(html.indexOf("</head>"));
    expect(body(htmlForRoute(shell, "/about", STATIC_SEO["/about"]))).toBe(body(shell));
  });

  it("escapes what it writes into an attribute", () => {
    const html = htmlForRoute(shell, "/x", { title: 'Oat & "barista"', description: "a < b" });
    expect(html).toContain('content="Oat &amp; &quot;barista&quot;"');
    expect(html).toContain('content="a &lt; b"');
  });

  it("refuses a shell it cannot stamp, rather than passing it through", () => {
    expect(() => htmlForRoute("<html><head></head></html>", "/about", STATIC_SEO["/about"])).toThrow();
  });
});
