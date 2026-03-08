import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FeedEngagement } from "./FeedEngagement";

const defaultProps = {
  likes: [] as { id: string; user_id: string; username?: string }[],
  commentsCount: 0,
  isLiked: false,
  isOwnPost: false,
  isLikePending: false,
  showComments: false,
  onLike: vi.fn(),
  onToggleComments: vi.fn(),
  onViewAllResults: vi.fn(),
  onEdit: vi.fn(),
};

describe("FeedEngagement", () => {
  it("renders like and comment counts", () => {
    render(<FeedEngagement {...defaultProps} />);
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBe(2); // like count + comment count
  });

  it("renders comment count with non-zero value", () => {
    render(<FeedEngagement {...defaultProps} commentsCount={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("calls onLike when like button is clicked (not own post)", () => {
    const onLike = vi.fn();
    render(<FeedEngagement {...defaultProps} onLike={onLike} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onLike).toHaveBeenCalledOnce();
  });

  it("calls onToggleComments when comment button is clicked", () => {
    const onToggleComments = vi.fn();
    render(<FeedEngagement {...defaultProps} onToggleComments={onToggleComments} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]);
    expect(onToggleComments).toHaveBeenCalledOnce();
  });

  it("shows edit button for own posts", () => {
    render(<FeedEngagement {...defaultProps} isOwnPost />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  it("hides edit button for other users' posts", () => {
    render(<FeedEngagement {...defaultProps} isOwnPost={false} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(3);
  });

  it("renders like count with likes", () => {
    const likes = [
      { id: "1", user_id: "u1", username: "Alice" },
      { id: "2", user_id: "u2", username: "Bob" },
    ];
    render(<FeedEngagement {...defaultProps} likes={likes} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
