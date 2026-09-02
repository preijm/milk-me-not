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

  // The row used to choose once, for every row at once: badges below the name
  // always, or a nowrap line that truncated them to "Bari…" and "Hazel…". On
  // the live board 28 of the 29 rows carrying badges have room for the first
  // one beside the name, and 22 have room for all of them, so wrapping lets
  // the browser answer per row.
  it("lets the name and the badges share a line, and wrap only if they must", () => {
    const { container } = render(
      <ProductIdentity brand="Natrue" product="Oat" isBarista flavors={["pumpkin_spice"]} />,
    );
    const line = container.querySelector(".story-product-name")?.closest(".flex-wrap");
    expect(line).not.toBeNull();
    expect(line?.textContent).toContain("Barista");
    expect(line?.textContent).toContain("Pumpkin spice");
  });

  it("keeps the name and whatever trails it from being split apart", () => {
    // The mobile card hangs an arrow off the name. Wrapped away from the word
    // it belongs to, it would read as pointing at a badge.
    const { container } = render(
      <ProductIdentity brand="Natrue" product="Oat" isBarista after={<i data-testid="arrow" />} />,
    );
    const name = container.querySelector(".story-product-name");
    expect(name?.parentElement?.querySelector('[data-testid="arrow"]')).not.toBeNull();
    expect(name?.parentElement?.className).toContain("shrink-0");
  });

  it("marks the product name so a link around it can underline it", () => {
    // story.css hangs `.story-linked-product:hover .story-product-name` off
    // this. Rename it here and the feed card's affordance goes quiet without
    // anything failing to compile.
    const { container } = render(<ProductIdentity brand="Oatly" product="Oat" />);
    expect(container.querySelector(".story-product-name")?.textContent).toBe("Oat");
  });

  it("colours barista and nothing else", () => {
    // Flavour was amber and properties were grey, so a row was a little
    // traffic light of three palettes for facts of quite different weight.
    render(
      <ProductIdentity brand="Natrue" product="Oat" isBarista flavors={["pumpkin_spice"]} properties={["organic"]} />,
    );
    const pill = (text: string) => screen.getByText(text).closest("span[class*='rounded-full']");
    expect(pill("Barista")?.className).toContain("bg-story-coffee-light");
    expect(pill("Pumpkin spice")?.className).toContain("bg-story-ink/6");
    expect(pill("Organic")?.className).toContain("bg-story-ink/6");
    expect(pill("Barista")?.className).not.toContain("bg-story-green");
  });

  // Barista is not the same kind of fact as a flavour: those say what is in
  // the carton, this says what it is engineered to do. The glyph marks that
  // apart; colour alone did not.
  it("gives barista a glyph and the other badges none", () => {
    const { container } = render(
      <ProductIdentity brand="Oatly" product="Oat" isBarista flavors={["vanilla"]} />,
    );
    const pills = [...container.querySelectorAll("span.rounded-full")];
    const barista = pills.find((p) => /Barista/.test(p.textContent ?? ""));
    const flavour = pills.find((p) => /Vanilla/.test(p.textContent ?? ""));
    expect(barista?.querySelector("svg")).toBeTruthy();
    expect(flavour?.querySelector("svg")).toBeNull();
  });

  // A cup on its own reads as "goes in coffee", which is true of every milk
  // here, and a label is needed for screen readers regardless.
  it("keeps the word beside the glyph", () => {
    render(<ProductIdentity brand="Oatly" product="Oat" isBarista />);
    expect(screen.getByText("Barista")).toBeInTheDocument();
  });

  // The mobile feed card leaves the identity about 120px, which is narrower
  // than "Oat →" plus one pill — so every card wrapped, and wrapped ragged.
  // Below the name the badges get the card's full 195px, which fits both
  // pills of every card on the live feed on one line.
  it("gives the badges a row of their own when the caller asks", () => {
    const { container } = render(
      <ProductIdentity brand="Alnatura" product="Oat" flavors={["matcha"]} properties={["no_added_sugar"]} badgesBelow />,
    );
    const nameRow = container.querySelector(".story-product-name")?.closest(".flex-wrap");
    expect(nameRow?.textContent).toBe("Oat");
    expect(screen.getByText("Matcha").closest(".flex-wrap")).not.toBe(nameRow);
    expect(screen.getByText("No added sugar").closest(".flex-wrap")).not.toBe(nameRow);
  });

  it("spends no row on badges a product does not have", () => {
    const { container } = render(<ProductIdentity brand="Bayernglück" product="Oat" badgesBelow />);
    expect(container.querySelectorAll(".flex-wrap").length).toBe(1);
  });
});
