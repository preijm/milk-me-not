/**
 * What we know about the companies behind the cartons.
 *
 * Two halves that keep quite different company, and the split is the point:
 *
 * - **`owner`** is durable. It changes when somebody is acquired, which is
 *   rarely, so it is worth filling in freely and it stays true for years.
 * - **`status`** is perishable. It is only ever a claim about the day someone
 *   checked, so it carries that date and a source, and most brands will never
 *   have one.
 *
 * A brand missing from this file is **unknown**, never "fine". That is the
 * whole reason `brandState` returns three things rather than a boolean: with
 * two, every brand nobody has looked at silently reads as still trading, and
 * the page lies about most of the board by default.
 *
 * Curated in code rather than in a column, for the same reasons the logos are:
 * no migration, no `reviewed` gate on a typo, and every change visible in a
 * diff next to the source it came from.
 */
import { brandSlug } from "./brandLogo";

/**
 * Three things get called a "brand" on this board, and they fail in three
 * different ways — which is why this is a field and not a note.
 *
 * - `own-label` — a supermarket's own line. Buyable in one chain, and it
 *   rarely dies; it gets renamed. It wears the retailer's mark, which is what
 *   the ALIASES in `brandLogo.ts` already encode.
 * - `group` — one brand in a large portfolio. It disappears by portfolio
 *   decision, market by market. Wunda left the UK eighteen months before the
 *   Netherlands.
 * - `independent` — its own company. When one of these goes, the products, the
 *   site and the domain go together, with no warning. DUG did exactly that.
 */
export type BrandOwnerKind = "own-label" | "group" | "independent";

export type BrandOwner = {
  /** The company, as a reader would recognise it. "Danone", not "Danone S.A." */
  name: string;
  kind: BrandOwnerKind;
  /** For an own-label, the chain you can actually buy it in. */
  chain?: string;
};

export type BrandStatus = {
  state: "listed" | "discontinued";
  /** ISO-3166 alpha-2, where the claim is only true of some markets. */
  markets?: string[];
  /** When it went, as far as we know. `YYYY` or `YYYY-MM`. */
  since?: string;
  /** The day a person last verified this. Without it the claim has no shelf life. */
  checked: string;
  source?: string;
};

export type BrandFacts = {
  owner?: BrandOwner;
  status?: BrandStatus;
};

/**
 * Keyed by the slug `brandSlug` produces, so this file and the logo folder
 * agree by construction rather than by anybody remembering to.
 */
const BRAND_FACTS: Record<string, BrandFacts> = {
  // ── Gone, and this is why the file exists ────────────────────────────
  wunda: {
    owner: { name: "Nestlé", kind: "group" },
    status: {
      state: "discontinued",
      markets: ["GB", "NL"],
      since: "2024-10",
      checked: "2026-08-30",
      source: "https://www.eiwittrends.nl/nestle-merk-wunda-is-niet-meer-te-koop/",
    },
  },
  dug: {
    owner: { name: "Veg of Lund", kind: "independent" },
    status: {
      // dug.se is a parked for-sale page and the parent's certificate no
      // longer matches its own domain.
      state: "discontinued",
      checked: "2026-08-30",
    },
  },

  // ── Supermarket own-labels ───────────────────────────────────────────
  // The chain is the useful half here: it is the difference between "rated 8.1"
  // and "rated 8.1, and only Lidl sells it".
  vemondo: { owner: { name: "Lidl", kind: "own-label", chain: "Lidl" } },
  "my-vay": { owner: { name: "Aldi", kind: "own-label", chain: "Aldi" } },
  biobio: { owner: { name: "Netto Marken-Discount", kind: "own-label", chain: "Netto" } },
  "take-it-veggie": { owner: { name: "Kaufland", kind: "own-label", chain: "Kaufland" } },
  "ah-terra": { owner: { name: "Albert Heijn", kind: "own-label", chain: "Albert Heijn" } },
  jumbo: { owner: { name: "Jumbo", kind: "own-label", chain: "Jumbo" } },
  picnic: { owner: { name: "Picnic", kind: "own-label", chain: "Picnic" } },
  "edeka-bio-my-veggie": { owner: { name: "EDEKA", kind: "own-label", chain: "EDEKA" } },
  "rewe-bio": { owner: { name: "REWE", kind: "own-label", chain: "REWE" } },
  "bio-plus": { owner: { name: "Superunie", kind: "own-label" } },
  dmbio: { owner: { name: "dm-drogerie markt", kind: "own-label", chain: "dm" } },

  // ── Brands inside a larger portfolio ─────────────────────────────────
  alpro: { owner: { name: "Danone", kind: "group" } },
  "friesche-vlag": { owner: { name: "FrieslandCampina", kind: "group" } },
  campina: { owner: { name: "FrieslandCampina", kind: "group" } },
  "oddly-good": { owner: { name: "Valio", kind: "group" } },
  sojasun: { owner: { name: "Triballat Noyal", kind: "group" } },
  elovena: { owner: { name: "Raisio", kind: "group" } },
  bjorg: { owner: { name: "Ecotone", kind: "group" } },
  zonnatura: { owner: { name: "Ecotone", kind: "group" } },
  alnatura: { owner: { name: "Alnatura", kind: "group" } },

  // ── Their own companies ──────────────────────────────────────────────
  oatly: { owner: { name: "Oatly Group", kind: "independent" } },
  vly: { owner: { name: "vly foods", kind: "independent" } },
  berief: { owner: { name: "Berief Food", kind: "independent" } },
  "rude-health": { owner: { name: "Rude Health", kind: "independent" } },
  natumi: { owner: { name: "Natumi", kind: "independent" } },
  joya: { owner: { name: "Joya", kind: "independent" } },
  sproud: { owner: { name: "Sproud", kind: "independent" } },
  mighty: { owner: { name: "Mighty Drinks", kind: "independent" } },
};

/**
 * What we hold on a brand, by the name the board spells it with.
 *
 * Deliberately does **not** go through `brandLogo`'s ALIASES. Those exist to
 * borrow a retailer's *artwork* — Vemondo wears Lidl's mark — and ownership
 * must not ride along with them: Lidl being alive says nothing about whether
 * Vemondo still exists. Every alias here is written out on its own line above,
 * with its own facts, precisely so nothing is inherited by accident.
 */
export const brandFacts = (brandName: string | null | undefined): BrandFacts | null => {
  const slug = brandSlug(brandName);
  if (!slug) return null;
  return BRAND_FACTS[slug] ?? null;
};

export type BrandState = "listed" | "discontinued" | "unchecked";

/** Never returns "listed" for a brand nobody has checked. That is the point. */
export const brandState = (brandName: string | null | undefined): BrandState =>
  brandFacts(brandName)?.status?.state ?? "unchecked";

/** How many brands we have recorded anything about — for the index's own copy. */
export const brandFactCount = (): number => Object.keys(BRAND_FACTS).length;
