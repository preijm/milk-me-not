import { describe, it, expect, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { RatingFact } from "@/hooks/useRatingFacts";
import Brands from "./Brands";
import BrandDetail from "./BrandDetail";

/**
 * The whole point of these two pages is what they say about a brand nobody has
 * checked, so that is what most of this asserts.
 */

vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));

const fact = (over: Partial<RatingFact>): RatingFact => ({
  product_id: null,
  brand_name: null,
  product_name: null,
  rating: 7,
  is_barista: null,
  price_quality_ratio: null,
  property_names: null,
  flavor_names: null,
  created_at: null,
  country_code: null,
  ...over,
});

const FACTS: RatingFact[] = [
  fact({ brand_name: "Alpro", product_name: "Oat", product_id: "a1", rating: 8, created_at: "2026-08-01T00:00:00Z" }),
  fact({ brand_name: "Alpro", product_name: "Oat", product_id: "a1", rating: 6, created_at: "2026-07-01T00:00:00Z" }),
  fact({ brand_name: "Alpro", product_name: "Soya", product_id: "a2", rating: 9, created_at: "2026-06-01T00:00:00Z" }),
  fact({ brand_name: "Wunda", product_name: "Original", product_id: "w1", rating: 7, created_at: "2025-03-01T00:00:00Z" }),
  fact({ brand_name: "Wunda", product_name: "Barista", product_id: "w2", rating: 6, created_at: "2025-02-01T00:00:00Z" }),
  fact({ brand_name: "Harvest Moon", product_name: "Oat", product_id: "h1", rating: 9, created_at: "2026-05-01T00:00:00Z" }),
];

vi.mock("@/hooks/useRatingFacts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/useRatingFacts")>();
  return { ...actual, fetchRatingFacts: () => Promise.resolve(FACTS) };
});

const draw = (path: string) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/brands" element={<Brands />} />
          <Route path="/brand/:brandSlug" element={<BrandDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("the brand index", () => {
  it("orders by evidence, not by score", async () => {
    const { container } = draw("/brands");
    await screen.findByText("Alpro");
    // Harvest Moon's single 9 is the best average here and must not lead.
    const names = [...container.querySelectorAll("a[href^='/brand/']")].map(
      (a) => a.querySelector(".story-product-name")?.textContent,
    );
    expect(names[0]).toBe("Alpro");
  });

  it("badges a brand that has stopped", async () => {
    draw("/brands");
    const row = (await screen.findByText("Wunda")).closest("a");
    expect(within(row as HTMLElement).getByText("Discontinued")).toBeInTheDocument();
  });

  it("says nothing at all about a brand nobody has checked", async () => {
    draw("/brands");
    const row = (await screen.findByText("Harvest Moon")).closest("a");
    // No badge is the design. What must never appear is a claim it is fine.
    expect(within(row as HTMLElement).queryByText("Still listed")).not.toBeInTheDocument();
    expect(within(row as HTMLElement).queryByText("Discontinued")).not.toBeInTheDocument();
  });

  it("does not call a brand listed just because its owner is known", async () => {
    draw("/brands");
    const row = (await screen.findByText("Alpro")).closest("a");
    expect(within(row as HTMLElement).queryByText("Still listed")).not.toBeInTheDocument();
    // Ownership is shown; status is not invented from it.
    expect(within(row as HTMLElement).getByText(/Danone/)).toBeInTheDocument();
  });

  it("links each row to that brand's page", async () => {
    draw("/brands");
    const row = (await screen.findByText("Wunda")).closest("a");
    expect(row).toHaveAttribute("href", "/brand/wunda");
  });

  it("names the kind of company, not just who owns it", async () => {
    draw("/brands");
    const alpro = (await screen.findByText("Alpro")).closest("a");
    expect(within(alpro as HTMLElement).getByText("Group")).toBeInTheDocument();
    expect(within(alpro as HTMLElement).getByText("Danone")).toBeInTheDocument();
  });
});

const click = (el: HTMLElement) => fireEvent.click(el);

const brandOrder = (container: HTMLElement) =>
  [...container.querySelectorAll("a[href^='/brand/']")].map(
    (a) => a.querySelector(".story-product-name")?.textContent,
  );

describe("sorting and filtering the index", () => {
  it("reorders when a column is pressed, and reverses on a second press", async () => {
    const { container } = draw("/brands");
    await screen.findByText("Alpro");

    click(screen.getByRole("button", { name: /sort by score/i }));
    // Harvest Moon's single 9 is the best average and should now lead.
    expect(brandOrder(container)[0]).toBe("Harvest Moon");

    click(screen.getByRole("button", { name: /sort by score/i }));
    expect(brandOrder(container)[0]).toBe("Wunda");
  });

  it("narrows to one kind of company", async () => {
    const { container } = draw("/brands");
    await screen.findByText("Alpro");

    click(screen.getByRole("button", { name: "Group" }));
    expect(brandOrder(container)).toEqual(["Alpro", "Wunda"]);
  });

  it("narrows to what you can no longer buy", async () => {
    const { container } = draw("/brands");
    await screen.findByText("Alpro");

    click(screen.getByRole("button", { name: "Discontinued only" }));
    expect(brandOrder(container)).toEqual(["Wunda"]);
  });

  it("offers a way back when a filter matches nothing", async () => {
    const { container } = draw("/brands");
    await screen.findByText("Alpro");

    click(screen.getByRole("button", { name: "Own-label" }));
    click(screen.getByRole("button", { name: "Discontinued only" }));
    expect(brandOrder(container)).toEqual([]);

    click(screen.getByRole("button", { name: /clear the filters/i }));
    expect(brandOrder(container).length).toBeGreaterThan(0);
  });
});

describe("a brand page", () => {
  it("leads with the fact that you cannot buy it", async () => {
    draw("/brand/wunda");
    expect(await screen.findByText(/cannot buy this any more/i)).toBeInTheDocument();
    // The claim carries where, when, and on whose word.
    expect(screen.getByText(/United Kingdom and Netherlands/)).toBeInTheDocument();
    expect(screen.getByText(/October 2024/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Source" })).toBeInTheDocument();
  });

  it("keeps the ratings and says why", async () => {
    draw("/brand/wunda");
    expect(await screen.findByText("Original")).toBeInTheDocument();
    expect(screen.getByText("Barista")).toBeInTheDocument();
    expect(screen.getByText(/These ratings stay/)).toBeInTheDocument();
  });

  it("does not put a discontinued panel on a brand that has not stopped", async () => {
    draw("/brand/alpro");
    await screen.findByText("Soya");
    expect(screen.queryByText(/cannot buy this any more/i)).not.toBeInTheDocument();
  });

  it("names the owner and what kind of company it is", async () => {
    draw("/brand/alpro");
    expect(await screen.findByText(/Part of a larger group/)).toBeInTheDocument();
  });

  it("tells a reader when nothing matches the address", async () => {
    draw("/brand/does-not-exist");
    expect(await screen.findByText(/No brand by that name/i)).toBeInTheDocument();
  });
});
