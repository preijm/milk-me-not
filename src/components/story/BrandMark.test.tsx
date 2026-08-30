import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrandMark } from "./BrandMark";
import { brandInitials as initials } from "./brandInitials";

/**
 * With no logo, this used to show the plant base — three letters like OAT,
 * inferred from the product name. That put "OAT" in the slot where a brand
 * logo goes, on a row already reading "AUCHAN / Oat": it named the wrong thing
 * and repeated the product name doing it.
 *
 * The rule is asserted directly rather than through the component. Going
 * through `BrandMark` meant every fixture had to be a brand with no logo file,
 * so adding one turned this file red for no reason connected to it — which
 * happened with `dmBio`, and again with "Oddly Good" and "Take it Veggie".
 */
describe("BrandMark initials", () => {
  it("takes the first letters of a two-word brand", () => {
    expect(initials("Oddly Good")).toBe("OG");
    expect(initials("Lazy Heroes")).toBe("LH");
    expect(initials("Just Plants")).toBe("JP");
  });

  it("takes the opening pair of a single-word brand", () => {
    expect(initials("Auchan")).toBe("AU");
    expect(initials("Provamel")).toBe("PR");
  });

  // "Take it Veggie" gave TI before, taking the connector nobody says.
  it("skips lowercase connectors", () => {
    expect(initials("Take it Veggie")).toBe("TV");
  });

  it("copes with punctuation and an all-lowercase name", () => {
    expect(initials("Plant Based!")).toBe("PB");
    expect(initials("eco mylk")).toBe("EM");
  });

  it("does not fall over on a missing brand", () => {
    expect(initials("")).toBe("?");
  });

  it("names the brand, not the plant base", () => {
    render(<BrandMark brand="Auchan" />);
    expect(screen.queryByText("OAT")).not.toBeInTheDocument();
    expect(screen.getByText("AU")).toBeInTheDocument();
  });
});
