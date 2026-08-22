import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { StoryLayout } from "./StoryLayout";

/**
 * Which bottom bar a page shows must key off the reader, not off which shell
 * the page happens to be built from.
 *
 * It used to key off the shell: the members' bar lived only on the five pages
 * using StoryAppLayout, so its own Board tab pointed at /results — a
 * StoryLayout page, which replaced the bar with a single "Start rating"
 * button. Tapping a tab destroyed the bar you tapped it in, and /feed and
 * /product/:id lost it the same way.
 */

const auth = vi.hoisted(() => ({ user: null as { id: string } | null }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: auth.user }) }));

vi.mock("./StoryHeader", () => ({ StoryHeader: () => <header data-testid="header" /> }));
vi.mock("./StoryAppBar", () => ({ StoryAppBar: () => <nav data-testid="member-bar" /> }));
vi.mock("./StoryFooter", () => ({
  StoryFooter: ({ variant = "full" }: { variant?: string }) => (
    <footer data-testid="footer" data-variant={variant} />
  ),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <StoryLayout>
        <p>page body</p>
      </StoryLayout>
    </MemoryRouter>,
  );

describe("StoryLayout bottom bar", () => {
  beforeEach(() => {
    auth.user = null;
  });

  it("gives a signed-out reader the single call to action", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /start rating/i })).toBeInTheDocument();
    expect(screen.queryByTestId("member-bar")).not.toBeInTheDocument();
  });

  it("gives a signed-in reader the member bar on a public page", () => {
    auth.user = { id: "u1" };
    renderPage();
    expect(screen.getByTestId("member-bar")).toBeInTheDocument();
  });

  it("does not stack a second call to action under the member bar", () => {
    auth.user = { id: "u1" };
    renderPage();
    expect(screen.queryByRole("button", { name: /rate a milk|start rating/i })).not.toBeInTheDocument();
  });

  it("drops the sitemap footer for a signed-in reader", () => {
    auth.user = { id: "u1" };
    renderPage();
    expect(screen.getByTestId("footer")).toHaveAttribute("data-variant", "member");
  });

  it("keeps the sitemap footer for a signed-out reader", () => {
    renderPage();
    expect(screen.getByTestId("footer")).toHaveAttribute("data-variant", "full");
  });

  it("still honours hideMobileCta when signed out", () => {
    render(
      <MemoryRouter>
        <StoryLayout hideMobileCta>
          <p>page body</p>
        </StoryLayout>
      </MemoryRouter>,
    );
    expect(screen.queryByRole("button", { name: /start rating/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId("member-bar")).not.toBeInTheDocument();
  });

  it("shows the member bar even when a page suppresses the call to action", () => {
    auth.user = { id: "u1" };
    render(
      <MemoryRouter>
        <StoryLayout hideMobileCta>
          <p>page body</p>
        </StoryLayout>
      </MemoryRouter>,
    );
    expect(screen.getByTestId("member-bar")).toBeInTheDocument();
  });
});
