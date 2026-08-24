import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductIdentity } from "./ProductIdentity";

/**
 * The scan match list asks "which carton is in your hand?" and has to render an
 * answer that can be told apart from the row above it.
 *
 * These are the real rows `search_product_types` returns for a scanned Alpro
 * carton. Two are called "Oat, Soya" and differ only by their flavour; six are
 * called "Soya". The dialog was passing only brand, name and barista to
 * ProductIdentity — every other call site in the app passes the flavour and
 * property arrays too — so those rows came out identical.
 */
const OAT_SOYA_CARAMEL = {
  brand_name: "Alpro",
  product_name: "Oat, Soya",
  is_barista: true,
  property_names: null,
  flavor_names: ["caramel"],
};

const OAT_SOYA_VANILLA = { ...OAT_SOYA_CARAMEL, flavor_names: ["vanilla"] };

const asIdentity = (m: typeof OAT_SOYA_CARAMEL) => (
  <ProductIdentity
    brand={m.brand_name}
    product={m.product_name}
    properties={m.property_names}
    flavors={m.flavor_names}
    isBarista={m.is_barista}
    size="sm"
  />
);

describe("scan match rows", () => {
  it("tells two cartons with the same name apart", () => {
    const { container: caramel } = render(asIdentity(OAT_SOYA_CARAMEL));
    const first = caramel.textContent;
    const { container: vanilla } = render(asIdentity(OAT_SOYA_VANILLA));

    expect(first).toContain("Caramel");
    expect(vanilla.textContent).toContain("Vanilla");
    expect(first).not.toBe(vanilla.textContent);
  });

  it("keeps the flavour when there is not room for every badge", () => {
    // Barista, flavour, then properties: the flavour is what separates two
    // rows, so it must not be the badge that gets cut.
    render(
      asIdentity({
        brand_name: "Alpro",
        product_name: "Soya",
        is_barista: true,
        property_names: ["protein"],
        flavor_names: ["chocolate"],
      }),
    );
    expect(screen.getByText("Chocolate")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("renders a row with no badges at all without inventing one", () => {
    const { container } = render(
      asIdentity({
        brand_name: "Alpro",
        product_name: "Rye",
        is_barista: false,
        property_names: null,
        flavor_names: null,
      }),
    );
    expect(container.querySelectorAll("span.rounded-full")).toHaveLength(0);
  });
});
