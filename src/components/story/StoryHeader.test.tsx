import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { StoryHeader } from "./StoryHeader";

/**
 * The desktop "Log in" link once had no `user` check at all — only the mobile
 * drawer's copy of it did — so a signed-in reader on a wide viewport saw "Log
 * in" sitting right next to their own avatar.
 */

const auth = vi.hoisted(() => ({ user: null as { id: string; email: string } | null }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: auth.user, signOut: vi.fn() }),
}));
vi.mock("@/hooks/useNotifications", () => ({
  useNotifications: () => ({ unreadCount: 0 }),
}));

const renderHeader = () =>
  render(
    <MemoryRouter>
      <StoryHeader />
    </MemoryRouter>,
  );

describe("StoryHeader", () => {
  it("offers to log in when signed out", () => {
    auth.user = null;
    renderHeader();
    expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
  });

  it("drops the log in link once signed in", () => {
    auth.user = { id: "u1", email: "reader@example.com" };
    renderHeader();
    expect(screen.queryByRole("link", { name: /log in/i })).not.toBeInTheDocument();
  });
});
