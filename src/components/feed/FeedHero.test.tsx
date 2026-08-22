import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FeedHero } from "./FeedHero";
import type { MilkTestResult } from "@/types/milk-test";

/**
 * Same rule as ResultsHero: the editorial open is for a stranger. A member
 * scrolled 1.39 screens past it to reach the first verdict.
 */
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/components/home/useStoryHome", () => ({
  useStoryHome: () => ({ data: { totalRatings: 360, products: 220, brands: 71 }, isLoading: false }),
}));

const items = [
  { id: "1", rating: 9, created_at: new Date().toISOString() } as unknown as MilkTestResult,
  { id: "2", rating: 8, created_at: new Date().toISOString() } as unknown as MilkTestResult,
];

const renderHero = (isAuthenticated: boolean) =>
  render(
    <MemoryRouter>
      <FeedHero items={items} isLoading={false} isAuthenticated={isAuthenticated} />
    </MemoryRouter>,
  );

describe("FeedHero", () => {
  it("gives a visitor the full open, including the ask", () => {
    renderHero(false);
    expect(screen.getByText(/poured recently/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start rating/i })).toBeInTheDocument();
  });

  it("drops the pitch for a member", () => {
    renderHero(true);
    expect(screen.queryByText(/Join free to comment/i)).not.toBeInTheDocument();
  });

  it("does not repeat the rating ask a member already has in the bar", () => {
    const { container } = renderHero(true);
    // The full hero is still in the tree for desktop, but hidden below `lg`.
    const hero = container.querySelector("section");
    expect(hero?.classList.contains("hidden")).toBe(true);
    expect(hero?.classList.contains("lg:block")).toBe(true);
  });

  it("tells a member what they are looking at and how fresh it is", () => {
    renderHero(true);
    expect(screen.getByText("The feed")).toBeInTheDocument();
    expect(screen.getByText(/2 verdicts/)).toBeInTheDocument();
  });
});
