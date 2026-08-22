import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductIdentity } from "./ProductIdentity";

/**
 * FeedProductInfo's tests already exercise the badge rules through the wrapper.
 * These cover the props the other seven call sites rely on: the size scale, and
 * dropping the mark where the row already has something on its left edge.
 */
describe("ProductIdentity", () => {
  it("always names the brand, even though most rows also show a logo", () => {
    // Only 25 of 71 brands have a logo. For the rest this line is the sole
    // thing saying who made it.
    render(<ProductIdentity brand="Alnatura" product="Oat" />);
    expect(screen.getByText("Alnatura")).toBeInTheDocument();
  });

  it("falls back rather than rendering a blank row", () => {
    render(<ProductIdentity brand={null} product={null} />);
    expect(screen.getByText("Unknown brand")).toBeInTheDocument();
    expect(screen.getByText("Unknown product")).toBeInTheDocument();
  });

  it("drops the mark when the caller already owns that edge", () => {
    const { container } = render(<ProductIdentity brand="Alpro" product="Oat" showMark={false} />);
    expect(container.querySelector("img")).toBeNull();
  });

  it("fits fewer badges in a dense row than a roomy one", () => {
    const props = { brand: "Oatly", product: "Oat", properties: ["organic", "high_protein", "gluten_free", "calcium"] };
    const small = render(<ProductIdentity {...props} size="sm" />);
    const smallCount = small.container.querySelectorAll("span.rounded-full").length;
    small.unmount();
    const large = render(<ProductIdentity {...props} size="lg" />);
    const largeCount = large.container.querySelectorAll("span.rounded-full").length;
    expect(largeCount).toBeGreaterThan(smallCount);
  });

  it("respects an explicit badge cap", () => {
    render(
      <ProductIdentity
        brand="Oatly"
        product="Oat"
        properties={["organic", "high_protein", "gluten_free"]}
        maxBadges={1}
      />,
    );
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  // In a dense list row the text column is only ~142px after a rank, a mark
  // and a score, which truncated two badges to "Bari…" and "Hazel…".
  it("can put the badges on their own line, clear of the narrow text column", () => {
    const props = { brand: "Natrue", product: "Oat", isBarista: true, flavors: ["pumpkin_spice"] };
    const inline = render(<ProductIdentity {...props} />).container.firstElementChild;
    expect(inline?.className).toContain("items-center");

    const below = render(<ProductIdentity {...props} badgesBelow />).container.firstElementChild;
    expect(below?.classList.contains("flex-col")).toBe(true);
  });

  it("shows both badges in full either way", () => {
    render(<ProductIdentity brand="Natrue" product="Oat" isBarista flavors={["pumpkin_spice"]} badgesBelow />);
    expect(screen.getByText("Barista")).toBeInTheDocument();
    expect(screen.getByText("Pumpkin spice")).toBeInTheDocument();
  });
});
