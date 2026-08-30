import { describe, it, expect } from "vitest";
import { brandFacts, brandState } from "./brandFacts";
import { getBrandLogo } from "./brandLogo";

describe("brand facts", () => {
  it("finds a brand however the board spells it", () => {
    expect(brandFacts("Wunda")?.owner?.name).toBe("Nestlé");
    expect(brandFacts("wunda")?.owner?.name).toBe("Nestlé");
    expect(brandFacts("Take it Veggie")?.owner?.chain).toBe("Kaufland");
    expect(brandFacts("BIO+")?.owner?.kind).toBe("own-label");
  });

  it("says nothing about a brand nobody has recorded", () => {
    expect(brandFacts("Hofgut Storzeln")).toBeNull();
    expect(brandFacts("")).toBeNull();
    expect(brandFacts(null)).toBeNull();
  });
});

/**
 * The three states are the whole design. With two, every brand nobody has
 * looked at reads as still trading, and the page quietly lies about most of
 * the board — so "unchecked" has to be its own answer rather than a falsy one.
 */
describe("brand state", () => {
  it("reports the two brands that have stopped", () => {
    expect(brandState("Wunda")).toBe("discontinued");
    expect(brandState("DUG")).toBe("discontinued");
  });

  it("does not claim a brand is listed just because we know who owns it", () => {
    // Alpro has an owner and no status. That is not a clean bill of health.
    expect(brandFacts("Alpro")?.owner?.name).toBe("Danone");
    expect(brandState("Alpro")).toBe("unchecked");
  });

  it("treats an unrecorded brand as unchecked, not as fine", () => {
    expect(brandState("Harvest Moon")).toBe("unchecked");
    expect(brandState(null)).toBe("unchecked");
  });
});

/**
 * `brandLogo`'s ALIASES let a own-label borrow its retailer's artwork. Status
 * must not ride along: Lidl is very much trading, and that says nothing about
 * whether Vemondo still is.
 */
describe("ownership does not inherit through the logo aliases", () => {
  it("gives Vemondo Lidl's mark without giving it Lidl's identity", () => {
    expect(getBrandLogo("Vemondo")).toBe(getBrandLogo("Lidl"));
    expect(brandFacts("Vemondo")?.owner?.name).toBe("Lidl");
    expect(brandFacts("Vemondo")?.owner?.kind).toBe("own-label");
  });

  it("keeps a group brand's own mark rather than its parent's", () => {
    // Nobody prints Danone on an Alpro carton, and the logo folder agrees.
    expect(getBrandLogo("Alpro")).not.toBeNull();
    expect(getBrandLogo("Danone")).toBeNull();
  });

  it("does not resolve a retailer's parent as a brand in its own right", () => {
    // "Kaufland" is here as an owner, not as something the board rates.
    expect(brandFacts("Kaufland")).toBeNull();
  });
});
