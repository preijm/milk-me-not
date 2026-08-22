import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Home from "./Home";

/**
 * Signed in, "home" is the feed.
 *
 * AuthContext starts with no session on purpose, so `user` is null for the
 * first frame or two of a cold load and this page renders the pitch. That is
 * deliberate — the alternative is blocking the site's most important public
 * page on an auth round-trip. What must hold is that a session arriving late
 * still redirects, which is the last test here.
 */

const auth = vi.hoisted(() => ({ user: null as { id: string } | null }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: auth.user }),
}));

vi.mock("@/components/Seo", () => ({ Seo: () => null }));
vi.mock("@/components/home/useStoryHome", () => ({
  useStoryHome: () => ({ data: null, isLoading: false }),
}));
vi.mock("@/components/story", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/components/story")>()),
  StoryLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="marketing-pitch">{children}</div>
  ),
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

describe("Home", () => {
  beforeEach(() => {
    auth.user = null;
  });

  it("sends a signed-in reader to the feed", () => {
    auth.user = { id: "u1" };
    renderAtRoot();
    expect(screen.getByText("the feed")).toBeInTheDocument();
  });

  it("does not show the pitch to someone who already joined", () => {
    auth.user = { id: "u1" };
    renderAtRoot();
    expect(screen.queryByTestId("marketing-pitch")).not.toBeInTheDocument();
  });

  it("shows the pitch to a signed-out visitor", () => {
    renderAtRoot();
    expect(screen.getByTestId("marketing-pitch")).toBeInTheDocument();
  });

  it("redirects once a late-arriving session resolves", () => {
    const { rerender } = renderAtRoot();
    expect(screen.getByTestId("marketing-pitch")).toBeInTheDocument();

    auth.user = { id: "u1" };
    rerender(tree());

    expect(screen.getByText("the feed")).toBeInTheDocument();
    expect(screen.queryByTestId("marketing-pitch")).not.toBeInTheDocument();
  });
});
