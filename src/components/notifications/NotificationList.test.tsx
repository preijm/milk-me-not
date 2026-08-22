import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NotificationList } from "./NotificationList";
import type { Notification } from "@/hooks/useNotifications";

/**
 * This list replaced two near-identical components (NotificationList and
 * MobileNotificationList) that each carried their own copy of the message
 * parser. These tests cover the surviving parser and the time grouping, since
 * the two formats in the table are the part a merge could quietly break.
 */

const state = vi.hoisted(() => ({
  notifications: [] as Notification[],
  loading: false,
}));
vi.mock("@/hooks/useNotifications", () => ({
  useNotifications: () => ({
    notifications: state.notifications,
    loading: state.loading,
    markAsRead: vi.fn(),
    unreadCount: 0,
  }),
}));

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

const make = (over: Partial<Notification> = {}): Notification => ({
  id: Math.random().toString(36).slice(2),
  user_id: "me",
  type: "like",
  title: "",
  message: "someone|Oatly - Barista",
  is_read: true,
  created_at: daysAgo(1),
  updated_at: daysAgo(1),
  ...over,
});

const renderList = () =>
  render(
    <MemoryRouter>
      <NotificationList variant="page" />
    </MemoryRouter>,
  );

describe("NotificationList", () => {
  beforeEach(() => {
    state.loading = false;
    state.notifications = [];
  });

  it("reads the pipe-delimited format", () => {
    state.notifications = [make({ message: "peter|Oatly - Barista|BARISTA|FLAVORS:vanilla" })];
    renderList();
    expect(screen.getByText("peter")).toBeInTheDocument();
    expect(screen.getByText("Oatly - Barista")).toBeInTheDocument();
    expect(screen.getByText("Barista")).toBeInTheDocument();
    expect(screen.getByText("vanilla")).toBeInTheDocument();
  });

  it("still reads the older prose format", () => {
    state.notifications = [make({ message: "peter liked your test of Alpro Oat" })];
    renderList();
    expect(screen.getByText("peter")).toBeInTheDocument();
    expect(screen.getByText("Alpro Oat")).toBeInTheDocument();
  });

  it("renders underscored property names as words", () => {
    state.notifications = [make({ message: "peter|Alpro|PROPERTIES:no_sugar" })];
    renderList();
    expect(screen.getByText("no sugar")).toBeInTheDocument();
  });

  it("distinguishes likes from comments", () => {
    state.notifications = [
      make({ id: "a", type: "like", message: "ann|Oatly" }),
      make({ id: "b", type: "comment", message: "bob|Alpro" }),
    ];
    renderList();
    expect(screen.getByText(/liked your rating/)).toBeInTheDocument();
    expect(screen.getByText(/commented on your rating/)).toBeInTheDocument();
  });

  it("groups by age", () => {
    state.notifications = [
      make({ id: "a", created_at: daysAgo(1) }),
      make({ id: "b", created_at: daysAgo(14) }),
      make({ id: "c", created_at: daysAgo(90) }),
    ];
    renderList();
    expect(screen.getByText("Last week")).toBeInTheDocument();
    expect(screen.getByText("Last month")).toBeInTheDocument();
    expect(screen.getByText("Earlier")).toBeInTheDocument();
  });

  it("omits a group with nothing in it", () => {
    state.notifications = [make({ created_at: daysAgo(1) })];
    renderList();
    expect(screen.getByText("Last week")).toBeInTheDocument();
    expect(screen.queryByText("Earlier")).not.toBeInTheDocument();
  });

  it("shows the empty state when there is nothing", () => {
    renderList();
    expect(screen.queryByText("Last week")).not.toBeInTheDocument();
  });

  it("says so while loading", () => {
    state.loading = true;
    renderList();
    expect(screen.getByText(/loading notifications/i)).toBeInTheDocument();
  });
});
