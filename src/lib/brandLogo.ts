/**
 * Brand logos for product rows and cards.
 *
 * Drop a file into `src/assets/brand-logos/` named after the brand and it is
 * picked up automatically — no registry to update. Vite bundles and hashes
 * whatever is in there, so unlike `public/` the files are content-addressed
 * and cache correctly.
 *
 * Brands without a logo fall back to a drawn mark, so a missing file is never
 * a broken image. See the folder's README for naming.
 */

const MODULES = import.meta.glob<string>("../assets/brand-logos/*.{png,jpg,jpeg,webp,svg,avif}", {
  eager: true,
  query: "?url",
  import: "default",
});

/**
 * Characters that survive Unicode decomposition and would otherwise be dropped
 * from a slug entirely — "Mølk" must not become "mlk".
 */
const TRANSLITERATIONS: Record<string, string> = {
  ø: "o",
  Ø: "o",
  æ: "ae",
  Æ: "ae",
  å: "a",
  Å: "a",
  ß: "ss",
  đ: "d",
  ð: "d",
  þ: "th",
  ł: "l",
};

/** "Arla Jörd" → "arla-jord", "Oatly!" → "oatly", "BIO+" → "bio-plus". */
export const brandSlug = (name: string | null | undefined): string => {
  if (!name) return "";
  return name
    .split("")
    .map((ch) => TRANSLITERATIONS[ch] ?? ch)
    .join("")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\+/g, " plus ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/** slug → bundled URL, built once from whatever is in the folder. */
const LOGOS: Record<string, string> = Object.fromEntries(
  Object.entries(MODULES).map(([path, url]) => {
    const file = path.split("/").pop() ?? "";
    const base = file.replace(/\.[^.]+$/, "");
    return [brandSlug(base), url];
  }),
);

/**
 * Alternate spellings that should resolve to the same file, so one logo can
 * cover a brand the catalogue names inconsistently.
 */
const ALIASES: Record<string, string> = {
  "oatly": "oatly",
  "ah-terra": "ah-terra",
  "albert-heijn-terra": "ah-terra",
  "rewe-beste-wahl": "rewe",
  "edeka-bio-my-veggie": "edeka",
  "dmbio": "dmbio",
  "dm-bio": "dmbio",
};

/** The logo URL for a brand, or null when we do not have one. */
export const getBrandLogo = (brandName: string | null | undefined): string | null => {
  const slug = brandSlug(brandName);
  if (!slug) return null;
  return LOGOS[slug] ?? LOGOS[ALIASES[slug] ?? ""] ?? null;
};

/** How many logos are currently bundled — used by the design-system page. */
export const brandLogoCount = (): number => Object.keys(LOGOS).length;
