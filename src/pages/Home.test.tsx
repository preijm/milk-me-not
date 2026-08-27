import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Home from "./Home";

/**
 * A member can reach the homepage.
 *
 * This page used to bounce anyone signed in to /feed, on the grounds that it
 * is the pitch and someone who already joined should not be sold twice. That
 * held for the hero and nothing else — below it the page is the live board,
 * the map and the week's new ratings, which is what somebody clicking the
 * wordmark came to see.
 *
 * So the pitch is what hides, not the page, exactly as on the feed and the
 * catalogue: whole for a visitor at every width and for everyone on a desktop,
 * gone for a member on a phone.
 */

const auth = vi.hoisted(() => ({ user: null as { id: string } | null }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: auth.user }),
}));

vi.mock("@/components/Seo", () => ({ Seo: () => null }));
vi.mock("@/components/home/useStoryHome", () => ({
  useStoryHome: () => ({ data: null, isLoading: false }),
}));

const tree = () => (
  <MemoryRouter initialEntries={["/"]}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/feed" element={<p>the feed</p>} />
    </Routes>
  </MemoryRouter>
);

const renderAtRoot = () => render(tree());

/** The hero band — the pitch, and the only part a member does not need. */
const hero = (container: HTMLElement) =>
  [...container.querySelectorAll("section")].find((s) => /Ditch the Moo/.test(s.textContent ?? ""));

describe("Home", () => {
  beforeEach(() => {
    auth.user = null;
  });

  it("no longer throws a member off its own homepage", () => {
    // The wordmark is the one link every site puts you back at the start with,
    // and this was the only one that could not.
    auth.user = { id: "u1" };
    renderAtRoot();
    expect(screen.queryByText("the feed")).toBeNull();
  });

  it("still gives a member the board, the map and the week", () => {
    auth.user = { id: "u1" };
    const { container } = renderAtRoot();
    expect(container.textContent).toContain("The board right now");
  });

  it("holds the pitch back from a member on a phone", () => {
    auth.user = { id: "u1" };
    const { container } = renderAtRoot();
    const band = hero(container);
    expect(band).toBeDefined();
    expect(band?.classList.contains("hidden")).toBe(true);
    expect(band?.classList.contains("lg:block")).toBe(true);
  });

  it("sells the project to a visitor at every width", () => {
    const { container } = renderAtRoot();
    const band = hero(container);
    expect(band?.classList.contains("hidden")).toBe(false);
  });

  it("takes the hero's own divider with it", () => {
    // Left behind, a member on a phone opens on a decorative crest attached to
    // nothing above it.
    auth.user = { id: "u1" };
    const { container } = renderAtRoot();
    const crest = container.querySelector(".text-story-paper");
    expect(crest?.classList.contains("hidden")).toBe(true);
  });
});
