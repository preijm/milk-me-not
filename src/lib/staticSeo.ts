/**
 * The title and description of every public page whose address is fixed.
 *
 * They live here rather than in each page because two things need them: the
 * page's own `<Seo>`, and the build, which stamps them into a file per route
 * (see `routeHeads` in vite.config.ts). Every URL used to be served the same
 * `index.html` — one title, one description, no canonical — and the right
 * ones only arrived once React had run. Google reads the raw file first, saw
 * nine copies of one page, and filed them as duplicates of the home page.
 *
 * `/` is absent on purpose. Its file is `index.html`, which the Worker also
 * serves for every address it has no file for — /product/:id, /brand/:slug —
 * so anything stamped into it would be claimed by all of those too.
 *
 * No imports: vite.config.ts loads this file in Node.
 */
export const SITE_URL = "https://milkmenot.com";

export const STATIC_SEO = {
  "/results": {
    title: "Results — Plant-milk ratings | Milk Me Not",
    description:
      "Browse aggregated ratings of plant-based milks from the Milk Me Not community. Filter by brand, base type and barista performance.",
  },
  "/brands": {
    title: "Every brand on the board — Milk Me Not",
    description:
      "All the makers behind the plant milks people have rated: who owns them, whether they are a supermarket own-label, how many ratings each has, and which ones you can no longer buy.",
  },
  "/feed": {
    title: "Feed — Latest plant-milk reviews | Milk Me Not",
    description:
      "The latest community taste tests of plant-based milks — photos, ratings and notes from real reviewers.",
  },
  "/about": {
    title: "It started with soy sauce — About Milk Me Not",
    description:
      "A joke between colleagues became a spreadsheet, then an obsession, then a public rating platform for every plant milk on the shelf. This is how Milk Me Not happened.",
  },
  "/contact": {
    title: "Contact — Milk Me Not",
    description:
      "Get in touch with the Milk Me Not team. Bug reports, missing brands, data corrections and plain old feedback — read by the two people who started this.",
  },
  "/faq": {
    title: "How ratings work — Milk Me Not",
    description:
      "Zero to ten, five named tiers, and a scale nobody can pay to move. How Milk Me Not's community scores are calculated, why price is tracked separately, and what happens if a brand ever pays us.",
  },
  "/mobile-app": {
    title: "Android app — Milk Me Not",
    description:
      "Download the Milk Me Not Android app. Scan a barcode, see the community verdict, rate it in seconds — without typing a thing.",
  },
  "/install-guide": {
    title: "Install guide — Milk Me Not",
    description:
      "A step-by-step guide to installing the Milk Me Not Android APK, including the unknown-source warning Android shows and why it's expected.",
  },
  "/privacy": {
    title: "Privacy — Milk Me Not",
    description:
      "What Milk Me Not collects, why, and who else ever sees it. Written in plain language, matched to what the code actually does.",
  },
} as const;

const escapeAttr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * `index.html` with one route's head written into it.
 *
 * Throws when a tag it expects is missing. The alternative is a rename in
 * index.html quietly turning this into a no-op, and nine routes going back to
 * sharing a head with every check green.
 */
export function htmlForRoute(
  shell: string,
  path: string,
  { title, description }: { title: string; description: string },
): string {
  const t = escapeAttr(title);
  const d = escapeAttr(description);
  const url = `${SITE_URL}${path}`;
  const content = (attr: string, value: string): [RegExp, string] => [
    new RegExp(`(<meta ${attr} content=")[^"]*`),
    value,
  ];

  const withTags = [
    content('name="description"', d),
    content('property="og:title"', t),
    content('property="og:description"', d),
    content('property="og:url"', url),
    content('name="twitter:title"', t),
    content('name="twitter:description"', d),
  ].reduce((html, [pattern, value]) => {
    if (!pattern.test(html)) throw new Error(`index.html has no tag matching ${pattern}`);
    return html.replace(pattern, (_, open: string) => open + value);
  }, shell);

  const titleTag = /<title>[^<]*<\/title>/;
  if (!titleTag.test(withTags)) throw new Error("index.html has no <title>");
  return withTags.replace(
    titleTag,
    () => `<title>${t}</title>\n    <link rel="canonical" href="${url}" />`,
  );
}
