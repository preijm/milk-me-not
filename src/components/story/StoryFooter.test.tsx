import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { StoryFooter } from "./StoryFooter";

/**
 * The full footer is three columns of "here is what this project is". That is
 * an advert for something a signed-in reader has already joined, and on a
 * phone it ran for screens underneath their own notifications page.
 */

const auth = vi.hoisted(() => ({ user: null as { id: string } | null }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: auth.user }) }));

const renderFooter = (variant?: "full" | "member") =>
  render(
    <MemoryRouter>
      <StoryFooter variant={variant} />
    </MemoryRouter>,
  );

describe("StoryFooter", () => {
  it("defaults to the full sitemap", () => {
    renderFooter();
    expect(screen.getByRole("navigation", { name: /scoreboard/i })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /get the app/i })).toBeInTheDocument();
  });

  it("closes the full footer with a pitch", () => {
    renderFooter("full");
    expect(screen.getByText(/what did you drink this week/i)).toBeInTheDocument();
  });

  it("drops the sitemap columns for members", () => {
    renderFooter("member");
    expect(screen.queryByRole("navigation", { name: /scoreboard/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: /get the app/i })).not.toBeInTheDocument();
  });

  it("stops pitching to someone who already joined", () => {
    renderFooter("member");
    expect(screen.queryByText(/what did you drink this week/i)).not.toBeInTheDocument();
  });

  it("keeps help and a route to a human reachable for members", () => {
    renderFooter("member");
    expect(screen.getByRole("link", { name: /how ratings work/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contact/i })).toBeInTheDocument();
  });

  // Below `lg` the tab bar is pinned to the bottom of the screen and is the end
  // of the page. A footer above it gives the page two endings.
  it("stays off a phone for members, where the tab bar is the end", () => {
    const { container } = renderFooter("member");
    expect(container.querySelector("footer")).toHaveClass("hidden", "lg:block");
  });

  it("shows on a phone for signed-out readers, who have no tab bar", () => {
    const { container } = renderFooter("full");
    expect(container.querySelector("footer")).not.toHaveClass("hidden");
  });

  it("keeps the copyright line in both variants", () => {
    const { unmount } = renderFooter("member");
    expect(screen.getByText(/nobody pays us/i)).toBeInTheDocument();
    unmount();
    renderFooter("full");
    expect(screen.getByText(/nobody pays us/i)).toBeInTheDocument();
  });
});
