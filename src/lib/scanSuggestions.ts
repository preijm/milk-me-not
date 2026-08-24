import type { ScannedProduct } from "./openFoodFacts";

/**
 * Turn what Open Food Facts said into what this form asks for.
 *
 * These are two different vocabularies, and the gap between them is the whole
 * reason this module exists. The board names a product by its milk base — the
 * `names` table holds "Oat", "Soya", "Almond", "Oat, Almond" — while OFF's
 * `product_name` is whatever is printed on the carton: "OAT-LY! iKAFFE BARISTA
 * EDITION". Putting the second into the first field does not merely look
 * untidy, it writes a new row into `names` that nobody will ever pick again,
 * and every scan of a product the board has not seen made one.
 *
 * The base is stated properly in the category tags, so that is what is read
 * here. Properties and flavours come out of the same place, and both are only
 * ever suggestions — every one of them lands on a control the reader can see
 * and undo before saving.
 *
 * Nothing is invented. A matcher that finds nothing yields nothing, and the
 * field is left blank for someone who can see the carton.
 */

/**
 * Milk bases, in the board's own spelling.
 *
 * The tag names come from OFF's category tree; the words are there because a
 * European carton is often tagged in its own language, and a Dutch oat drink
 * tagged only `haverdrank` would otherwise read as no base at all.
 */
const BASES: Array<{ name: string; word: string; match: RegExp }> = [
  { name: "Oat", word: "oat", match: /\boat\b|oat-|haver|hafer|avena|avoine/ },
  { name: "Soya", word: "soy", match: /\bsoy\b|\bsoya\b|soy-|soja/ },
  { name: "Almond", word: "almond", match: /almond|amande|mandel|amandel|mandorla/ },
  { name: "Coconut", word: "coconut", match: /coconut|kokos|noix-de-coco|cocco/ },
  { name: "Rice", word: "rice", match: /\brice\b|rice-|reis|rijst|\briz\b/ },
  { name: "Hazelnut", word: "hazelnut", match: /hazelnut|noisette|haselnuss|hazelnoot/ },
  { name: "Cashew", word: "cashew", match: /cashew|anacardi/ },
  { name: "Hemp", word: "hemp", match: /\bhemp\b|hemp-|hanf|hennep|chanvre/ },
  { name: "Spelt", word: "spelt", match: /spelt|dinkel|epeautre/ },
  { name: "Pea", word: "pea", match: /\bpea\b|pea-|erbsen|pois\b/ },
  { name: "Potato", word: "potato", match: /potato|aardappel|kartoffel|pomme-de-terre/ },
  { name: "Buckwheat", word: "buckwheat", match: /buckwheat|boekweit|buchweizen|sarrasin/ },
  { name: "Millet", word: "millet", match: /millet|hirse|gierst/ },
  { name: "Rye", word: "rye", match: /\brye\b|rye-|rogge|roggen|seigle/ },
  { name: "Lupine", word: "lupin", match: /lupin/ },
  { name: "Tiger Nut", word: "tiger-nut", match: /tiger-?nut|chufa|tijgernoot/ },
];

/**
 * A tag from OFF's own category tree, rather than something a contributor
 * typed.
 *
 * This distinction is load-bearing. A real Alpro almond carton
 * (5411188110835) carries `almond-based-drinks` — the canonical tag — and also
 * `cashewdrink`, which someone added by hand and which is simply wrong.
 * Reading both gives "Almond, cashew" for a pure almond drink. Where a
 * canonical tag exists it is believed, and the looser word matching below is
 * not consulted at all.
 */
const canonicalTag = (word: string) =>
  new RegExp(`^${word}-(based-)?(drinks?|milks?|beverages?)$`);

/**
 * Property keys, as the `properties` table spells them.
 *
 * Only the ones a carton states plainly. `naturel` and the fat percentages are
 * left out on purpose: "natural" appears on OFF labels that mean nothing of
 * the sort, and a percentage on a plant milk is rarely the one the board means.
 */
type Matcher = {
  key: string;
  /** Checked against the tags and the carton's own name alike. */
  match?: RegExp;
  /** Checked against the carton's own name and brand only, never the tags. */
  nameOnly?: RegExp;
};

/**
 * Property keys, as the `properties` table spells them.
 *
 * Only the ones a carton states plainly. `naturel` and the fat percentages are
 * left out on purpose: "natural" appears on OFF labels that mean nothing of
 * the sort, and a percentage on a plant milk is rarely the one the board means.
 */
const PROPERTIES: Matcher[] = [
  { match: /\bbio\b|bio-|organic|biologique|biologisch/, key: "bio" },
  { key: "no_sugar", match: /no-added-sugar|no-sugar|sugar-free|sans-sucres-ajoutes|zonder-toegevoegde-suiker|ohne-zuckerzusatz/ },
  { key: "unsweetened", match: /unsweetened|ungesuesst|ungesuess|ongezoet|non-sucre/ },
  {
    // "Protein" on the board means a high-protein carton. Nearly every soy
    // drink carries OFF's `source-of-protein` claim, which is a nutrition fact
    // rather than a product line, so the tags are only believed when they say
    // "high" or "rich" — while a carton whose own name says Protein is taken
    // at its word.
    key: "protein",
    match: /high-protein|protein-rich|rich-in-protein|eiwitrijk|proteinreich/,
    nameOnly: /\bprotein\b|\beiwit\b/,
  },
  { key: "roasted", match: /roasted|geroestet|geroosterd|torrefie/ },
  { key: "creamy", match: /creamy|cremig|romig/ },
  // No `powder`. OFF files ordinary liquid milk under
  // `milks-liquid-and-powder`, which matched every carton in that tree — a
  // supermarket own-brand cow milk (8712800147008) came back tagged Powder. A
  // property nobody meant is worse than one the reader ticks themselves.
];

/** Flavour keys, as the `flavors` table spells them. */
const FLAVORS: Matcher[] = [
  { key: "vanilla", match: /vanilla|vanille|vanilj/ },
  { key: "chocolate", match: /chocolate|chocolat|schoko|chocolade|\bchoco\b/ },
  { key: "cacao", match: /\bcacao\b|\bcocoa\b/ },
  { key: "caramel", match: /caramel|karamell/ },
  { key: "banana", match: /banana|banaan|banane/ },
  { key: "strawberry", match: /strawberry|aardbei|erdbeer|fraise/ },
  { key: "peach", match: /peach|perzik|pfirsich|peche/ },
  { key: "hazelnut", match: /hazelnut|noisette|haselnuss|hazelnoot/ },
  { key: "coconut", match: /coconut|kokos/ },
  { key: "pistachio", match: /pistach/ },
  { key: "matcha", match: /matcha/ },
  { key: "macchiato", match: /macchiato/ },
  { key: "pumpkin_spice", match: /pumpkin-?spice/ },
  { key: "popcorn", match: /popcorn/ },
  { key: "churros", match: /churro/ },
  { key: "red_fruits", match: /red-?fruit|rode-?vrucht|fruits-?rouges/ },
  { key: "orange_mango", match: /orange.*mango|mango.*orange/ },
];

export type ScanSuggestion = {
  /** Milk bases found, board spelling, in the order they are listed above. */
  bases: string[];
  /** Property keys for the `properties` table. */
  properties: string[];
  /** Flavour keys for the `flavors` table. */
  flavors: string[];
};

/**
 * Everything worth matching against, as one lower-case string.
 *
 * Tags and free text are searched together rather than separately because
 * neither is reliable alone: OFF tags an Oatly carton `oat-based-drinks` and
 * says nothing about barista, while another carton says "Barista Oat" in its
 * name and carries no category tag at all. Spaces become hyphens so a single
 * pattern matches "oat drink", "oat-drink" and the `oat-based-drinks` tag.
 */
const flatten = (parts: string[]): string =>
  parts.join(" ").toLowerCase().replace(/[\s_]+/g, "-");

const haystack = (scanned: Pick<ScannedProduct, "tags" | "name" | "brand">): string =>
  flatten([...scanned.tags, scanned.name ?? "", scanned.brand ?? ""]);

/** Just the carton's own words, for matchers that must not read OFF's claims. */
const printed = (scanned: Pick<ScannedProduct, "name" | "brand">): string =>
  flatten([scanned.name ?? "", scanned.brand ?? ""]);

const hits = (m: Matcher, text: string, name: string): boolean =>
  Boolean(m.match?.test(text)) || Boolean(m.nameOnly?.test(name));

export const suggestFromScan = (
  scanned: Pick<ScannedProduct, "tags" | "name" | "brand">,
): ScanSuggestion => {
  const text = haystack(scanned);
  const name = printed(scanned);
  const tags = scanned.tags.map((t) => t.toLowerCase());

  /**
   * Two sources are trusted, and a third only when they find nothing.
   *
   * A canonical category tag is OFF's own classification, and the carton's
   * printed name is something the reader can check against what is in their
   * hand. Either is good evidence. A loose word in a contributor-added tag is
   * not: that is where `cashewdrink` sits on an almond carton. So stray tags
   * are consulted only when nothing better turned anything up at all, which
   * keeps a Dutch carton tagged `haverdrank` and named nothing useful from
   * coming back with no base, without letting a stray tag contaminate an
   * answer that already had one.
   */
  const trusted = BASES.filter(
    (b) => tags.some((t) => canonicalTag(b.word).test(t)) || b.match.test(name),
  );
  const bases = (trusted.length > 0 ? trusted : BASES.filter((b) => b.match.test(text))).map(
    (b) => b.name,
  );

  // A coconut milk is not coconut-flavoured, and a hazelnut milk is not
  // hazelnut-flavoured. Where a word is both a base and a flavour, the base
  // wins and the flavour is dropped — otherwise every carton of Alpro Coconut
  // arrives with a flavour badge nobody meant.
  const baseKeys = new Set(bases.map((b) => b.toLowerCase().replace(/\s+/g, "_")));

  return {
    bases,
    properties: PROPERTIES.filter((p) => hits(p, text, name)).map((p) => p.key),
    flavors: FLAVORS.filter((f) => hits(f, text, name) && !baseKeys.has(f.key)).map((f) => f.key),
  };
};

/**
 * Choose a name the board already uses, or nothing.
 *
 * A carton of oat-and-almond drink should land on the existing "Oat, Almond"
 * rather than on "Oat" plus a quiet loss of the almond, so an exact match on
 * the whole set is tried first. Failing that a single base is a fair
 * suggestion, and two bases with no combined name on the board is left blank —
 * a reader looking at the carton will do better than a guess that drops half
 * of it.
 *
 * Only ever returns a name that is already in the list. Suggesting one that is
 * not would create it on save, which is the pollution this exists to stop.
 */
export const pickBoardName = (bases: string[], boardNames: string[]): string | null => {
  if (bases.length === 0) return null;

  const wanted = [...bases].map((b) => b.toLowerCase()).sort().join("|");
  const exact = boardNames.find(
    (n) =>
      n
        .split(",")
        .map((part) => part.trim().toLowerCase())
        .sort()
        .join("|") === wanted,
  );
  if (exact) return exact;

  if (bases.length > 1) return null;
  return boardNames.find((n) => n.toLowerCase() === bases[0].toLowerCase()) ?? null;
};
