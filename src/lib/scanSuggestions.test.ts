import { describe, it, expect } from "vitest";
import { suggestFromScan, pickBoardName } from "./scanSuggestions";

/** The board's real name list, as `names` holds it. */
const BOARD_NAMES = [
  "Almond",
  "Almond, cashew",
  "Coconut",
  "Hazelnut",
  "Oat",
  "Oat, Almond",
  "Oat, Coconut",
  "Rice",
  "Soya",
  "Soya, Oat",
];

const scan = (tags: string[], name: string | null = null, brand: string | null = null) => ({
  tags,
  name,
  brand,
});

describe("suggestFromScan", () => {
  it("reads the milk base from the category tag, not the carton's own name", () => {
    // The case this module was written for: OFF's name is unusable as a board
    // name, and the tag says exactly what the board would call it.
    const s = suggestFromScan(
      scan(["plant-based-milk-alternatives", "oat-based-drinks"], "OAT-LY! iKAFFE BARISTA EDITION", "Oatly!"),
    );
    expect(s.bases).toEqual(["Oat"]);
  });

  it("reads a base stated only in the product name", () => {
    expect(suggestFromScan(scan([], "Soya Drink Original")).bases).toEqual(["Soya"]);
  });

  it("reads a base tagged in another language", () => {
    expect(suggestFromScan(scan(["haverdrank"])).bases).toEqual(["Oat"]);
    expect(suggestFromScan(scan(["mandeldrink"])).bases).toEqual(["Almond"]);
  });

  it("finds both bases in a blend", () => {
    expect(suggestFromScan(scan(["oat-based-drinks"], "Oat & Almond")).bases).toEqual([
      "Oat",
      "Almond",
    ]);
  });

  it("suggests nothing for a carton it cannot place", () => {
    const s = suggestFromScan(scan(["carbonated-drinks"], "Sparkling Water"));
    expect(s.bases).toEqual([]);
    expect(s.properties).toEqual([]);
    expect(s.flavors).toEqual([]);
  });

  it("picks up properties the carton states", () => {
    const s = suggestFromScan(scan(["organic", "en:no-added-sugar"], "Barista Oat Organic"));
    expect(s.properties).toContain("bio");
    expect(s.properties).toContain("no_sugar");
  });

  it("does not read a percentage or 'natural' as a property", () => {
    // Left out deliberately; asserted so a later addition is a decision.
    const s = suggestFromScan(scan(["natural-mineral-waters"], "Naturel 1.5%"));
    expect(s.properties).toEqual([]);
  });

  it("finds a flavour in the product name", () => {
    expect(suggestFromScan(scan([], "Oat Drink Vanilla")).flavors).toEqual(["vanilla"]);
    expect(suggestFromScan(scan([], "Soya Chocolate")).flavors).toEqual(["chocolate"]);
  });

  it("does not call a coconut milk coconut-flavoured", () => {
    // The word is both a base and a flavour. The base wins.
    const s = suggestFromScan(scan(["coconut-milks"], "Coconut Drink"));
    expect(s.bases).toEqual(["Coconut"]);
    expect(s.flavors).toEqual([]);
  });

  it("reads a second nut on the carton as part of the blend, not as a flavour", () => {
    // "Oat Drink Hazelnut" is genuinely ambiguous — a hazelnut-flavoured oat
    // drink, or an oat and hazelnut blend. Treating it as a blend is the safe
    // reading: pickBoardName only offers a combined name the board already
    // has, so an unknown pairing leaves the field blank for the reader rather
    // than committing to a guess.
    const s = suggestFromScan(scan(["oat-based-drinks"], "Oat Drink Hazelnut"));
    expect(s.bases).toEqual(["Oat", "Hazelnut"]);
    expect(s.flavors).toEqual([]);
  });

  it("does not read a generic protein claim as the Protein property", () => {
    // Nearly every soy drink carries OFF's source-of-protein claim. It is a
    // nutrition fact, not a product line, and it made a plain Lima soya drink
    // arrive with a Protein badge nobody meant.
    const s = suggestFromScan(scan(["en:source-of-protein", "soy-based-drinks"], "Soya Drink"));
    expect(s.properties).not.toContain("protein");
  });

  it("does read a carton that calls itself Protein", () => {
    expect(suggestFromScan(scan([], "Alpro Protein Soya")).properties).toContain("protein");
    expect(suggestFromScan(scan(["en:high-protein"], "Soya Drink")).properties).toContain("protein");
  });

  it("does not read `milks-liquid-and-powder` as the Powder property", () => {
    // A supermarket cow milk (8712800147008) is filed under that category and
    // came back tagged Powder.
    const s = suggestFromScan(scan(["milks-liquid-and-powder", "dairy-drinks"], "Halfvolle Melk"));
    expect(s.properties).toEqual([]);
  });

  it("believes the canonical category tag over a contributor's stray one", () => {
    // A real Alpro almond carton (5411188110835) carries both
    // `almond-based-drinks` and a hand-added `cashewdrink`. Reading both
    // returned "Almond, cashew" for a pure almond drink.
    const s = suggestFromScan(
      scan(["almond-based-drinks", "nut-based-drinks", "cashewdrink"], "Alpro Mandeldrink"),
    );
    expect(s.bases).toEqual(["Almond"]);
  });

  it("falls back to loose matching when no canonical tag is present", () => {
    expect(suggestFromScan(scan(["plant-based-beverages"], "Haverdrink")).bases).toEqual(["Oat"]);
  });
});

describe("pickBoardName", () => {
  it("matches a blend to the board's combined name", () => {
    expect(pickBoardName(["Oat", "Almond"], BOARD_NAMES)).toBe("Oat, Almond");
  });

  it("matches a combined name regardless of the order the bases were found", () => {
    expect(pickBoardName(["Oat", "Soya"], BOARD_NAMES)).toBe("Soya, Oat");
  });

  it("uses a single base when the board already has it", () => {
    expect(pickBoardName(["Oat"], BOARD_NAMES)).toBe("Oat");
  });

  it("leaves a blend the board has no name for blank, rather than losing half of it", () => {
    expect(pickBoardName(["Rice", "Hazelnut"], BOARD_NAMES)).toBeNull();
  });

  it("never suggests a name the board does not already have", () => {
    // Suggesting one would create it on save, which is the pollution this
    // whole module exists to stop.
    expect(pickBoardName(["Millet"], BOARD_NAMES)).toBeNull();
  });

  it("suggests nothing when nothing was found", () => {
    expect(pickBoardName([], BOARD_NAMES)).toBeNull();
  });

  it("returns the board's own spelling, not this module's", () => {
    // The board writes "Almond, cashew" with a lower-case c, and the names
    // table is the authority on that — not the base list in this file, which
    // spells them "Almond" and "Cashew". Returning anything but the board's
    // exact string would create a second, differently-spelled row on save.
    expect(pickBoardName(["Almond", "Cashew"], BOARD_NAMES)).toBe("Almond, cashew");
  });
});
