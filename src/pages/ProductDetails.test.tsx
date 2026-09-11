import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProductDetails from "./ProductDetails";

/**
 * A product page is the one a search result with stars would land on, so what
 * it tells a crawler before the data arrives matters. Googlebot renders the
 * page and can act on a noindex it sees on the way, even one the loaded page
 * takes back.
 */

const state = vi.hoisted(() => ({
  story: { story: null, isLoading: true, notFound: false } as {
    story: null;
    isLoading: boolean;
    notFound: boolean;
  },
}));

vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/components/product/useProductStory", () => ({
  useProductStory: () => state.story,
}));
// A span, not a meta: React 19 hoists <meta> into <head>, out of screen's reach.
vi.mock("@/components/Seo", () => ({
  Seo: ({ noindex }: { noindex?: boolean }) => <span data-testid="seo" data-noindex={String(!!noindex)} />,
}));

const draw = () =>
  render(
    <MemoryRouter initialEntries={["/product/p1"]}>
      <Routes>
        <Route path="/product/:productId" element={<ProductDetails />} />
      </Routes>
    </MemoryRouter>,
  );

describe("a product page before its data", () => {
  it("does not tell a crawler to go away while it is loading", () => {
    state.story = { story: null, isLoading: true, notFound: false };
    draw();
    expect(screen.getByTestId("seo")).toHaveAttribute("data-noindex", "false");
  });

  it("keeps a failed fetch out of the index", () => {
    // No story and no notFound once loading stops: the request errored, and a
    // skeleton is not a page worth indexing.
    state.story = { story: null, isLoading: false, notFound: false };
    draw();
    expect(screen.getByTestId("seo")).toHaveAttribute("data-noindex", "true");
  });

  it("keeps a missing carton out of the index", () => {
    state.story = { story: null, isLoading: false, notFound: true };
    draw();
    expect(screen.getByTestId("seo")).toHaveAttribute("data-noindex", "true");
  });
});
