import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ResultsHero } from "./ResultsHero";

/**
 * The hero is the pitch, and the pitch is for people who have not joined.
 *
 * A member opening the rankings on a phone had to scroll past 1.26 screens of
 * it to reach the first product. They get the page name and the score key
 * instead — but only on a phone: on a desktop the room exists and the hero
 * stays. So the rule is expressed in CSS rather than by unmounting, and these
 * tests assert on that rather than on whether the text is in the document.
 */
const auth = vi.hoisted(() => ({ user: null as { id: string } | null }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: auth.user }) }));

const stats = { products: 220, ratings: 350, brands: 71 };
const renderHero = () =>
  render(
    <MemoryRouter>
      <ResultsHero stats={stats} isLoading={false} />
    </MemoryRouter>,
  );

describe("ResultsHero", () => {
  beforeEach(() => {
    auth.user = null;
  });

  it("sells the catalogue to a visitor at every width", () => {
    const { container } = renderHero();
    expect(screen.getByText(/anyone bothered to score/i)).toBeInTheDocument();
    expect(container.querySelector("section")?.classList.contains("hidden")).toBe(false);
  });

  it("holds the pitch back from a member on a phone", () => {
    auth.user = { id: "u1" };
    const { container } = renderHero();
    const hero = container.querySelector("section");
    expect(hero?.classList.contains("hidden")).toBe(true);
    expect(hero?.classList.contains("lg:block")).toBe(true);
  });

  it("gives a member a compact head instead", () => {
    auth.user = { id: "u1" };
    renderHero();
    expect(screen.getByRole("heading", { name: "Rankings" })).toBeInTheDocument();
  });

  it("gives a visitor no compact head, since they have the hero", () => {
    renderHero();
    expect(screen.queryByRole("heading", { name: "Rankings" })).not.toBeInTheDocument();
  });

  // The legend is the key to the word on every row below, so it is reference
  // rather than pitch and has to survive the cut on a phone.
  it("keeps a visible score key for a member on a phone", () => {
    auth.user = { id: "u1" };
    const { container } = renderHero();
    const keys = [...container.querySelectorAll("div")].filter(
      (d) => /Gem/.test(d.textContent ?? "") && !d.closest("section"),
    );
    expect(keys.length).toBeGreaterThan(0);
  });
});
