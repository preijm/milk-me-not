import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FeedPullQuote } from "./FeedPullQuote";
import type { MilkTestResult } from "@/types/milk-test";

/**
 * The feed page hides this from a member on a phone by passing a class, so the
 * class has to actually reach the band. A visitor, and anyone on a desktop,
 * still gets it.
 */
const items = [
  { id: "1", rating: 9.4, notes: "Thick, not tasting like water", brand_name: "Melkan", product_name: "Soya", created_at: new Date().toISOString() },
  { id: "2", rating: 7, notes: "Fine", brand_name: "Alpro", product_name: "Oat", created_at: new Date().toISOString() },
] as unknown as MilkTestResult[];

const renderQuote = (className?: string) =>
  render(
    <MemoryRouter>
      <FeedPullQuote items={items} className={className} />
    </MemoryRouter>,
  );

describe("FeedPullQuote", () => {
  it("features the best-scored note in the loaded window", () => {
    renderQuote();
    expect(screen.getByText(/Thick, not tasting like water/)).toBeInTheDocument();
  });

  it("shows by default, which is what a visitor gets", () => {
    const { container } = renderQuote();
    expect(container.querySelector("section")?.classList.contains("hidden")).toBe(false);
  });

  it("can be held back below lg, which is what a member gets", () => {
    const { container } = renderQuote("hidden lg:block");
    const band = container.querySelector("section");
    expect(band?.classList.contains("hidden")).toBe(true);
    expect(band?.classList.contains("lg:block")).toBe(true);
  });
});
