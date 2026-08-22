import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeedProductInfo } from "./FeedProductInfo";

/**
 * These used to assert the joined string "Oatly - Original". Brand and product
 * are now separate lines — one of eight formats this project had for the same
 * four facts — so the assertions move to the two names being present rather
 * than to the punctuation between them.
 */
describe("FeedProductInfo", () => {
  it("names the brand and the product", () => {
    render(<FeedProductInfo brandName="Oatly" productName="Original" />);
    expect(screen.getByText("Oatly")).toBeInTheDocument();
    expect(screen.getByText("Original")).toBeInTheDocument();
  });

  // Deliberately not productName="Barista": that is a real Oatly carton, but
  // as a fixture it collides with the badge and the assertion stops meaning
  // anything.
  it("marks a barista carton", () => {
    render(<FeedProductInfo brandName="Oatly" productName="Original" isBarista />);
    expect(screen.getByText("Barista")).toBeInTheDocument();
  });

  it("says nothing when it is not one", () => {
    render(<FeedProductInfo brandName="Oatly" productName="Original" isBarista={false} />);
    expect(screen.queryByText("Barista")).not.toBeInTheDocument();
  });

  it("shows properties as words, never as column values", () => {
    render(<FeedProductInfo brandName="Oatly" productName="Original" propertyNames={["sugar_free"]} />);
    expect(screen.getByText("Sugar free")).toBeInTheDocument();
  });

  it("shows the flavour, which is often the only thing separating two rows", () => {
    render(<FeedProductInfo brandName="Oatly" productName="Original" flavorNames={["vanilla"]} />);
    expect(screen.getByText("Vanilla")).toBeInTheDocument();
  });

  // Flavour outranks properties when the badges do not all fit: two cartons of
  // the same product differ by flavour far more often than by "organic".
  it("keeps the flavour when badges have to be dropped", () => {
    render(
      <FeedProductInfo
        brandName="Oatly"
        productName="Original"
        flavorNames={["vanilla"]}
        propertyNames={["organic", "high_protein", "gluten_free"]}
      />,
    );
    expect(screen.getByText("Vanilla")).toBeInTheDocument();
    expect(screen.queryByText("Gluten free")).not.toBeInTheDocument();
  });

  it("counts what it had to leave out", () => {
    render(
      <FeedProductInfo
        brandName="Oatly"
        productName="Original"
        propertyNames={["organic", "high_protein", "gluten_free", "lactose_free"]}
      />,
    );
    expect(screen.getByText(/^\+\d+$/)).toBeInTheDocument();
  });

  it("renders with nothing but the two names", () => {
    render(<FeedProductInfo brandName="Alpro" productName="Soy" />);
    expect(screen.getByText("Alpro")).toBeInTheDocument();
    expect(screen.getByText("Soy")).toBeInTheDocument();
  });
});
