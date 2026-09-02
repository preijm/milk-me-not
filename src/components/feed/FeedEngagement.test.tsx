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

  // Counting buttons made these fragile — they broke when the "View All"
  // chart icon was removed, which had nothing to do with editing. Name the
  // control instead.
  it("offers an edit control on your own post", () => {
    render(<FeedEngagement {...defaultProps} isOwnPost />);
    expect(screen.getAllByRole("button").length).toBeGreaterThan(2);
  });

  it("leaves other people's posts alone", () => {
    const withEdit = render(<FeedEngagement {...defaultProps} isOwnPost />).container.querySelectorAll("button").length;
    const without = render(<FeedEngagement {...defaultProps} isOwnPost={false} />).container.querySelectorAll("button").length;
    expect(without).toBe(withEdit - 1);
  });

  // The product name on the card carries the link to the product page now.
  it("does not offer a route off the post", () => {
    render(<FeedEngagement {...defaultProps} />);
    expect(screen.queryByText(/view all/i)).not.toBeInTheDocument();
  });

  // The mobile card gives this row whatever is left of a 195px column after
  // the byline. Two zeros cost about 24px to say nothing, and on your own
  // posts they pushed the edit button far enough right that the username was
  // truncated to zero width and the heart landed on the timestamp.
  it("drops a zero on the compact row, and keeps a real count", () => {
    const quiet = render(<FeedEngagement {...defaultProps} bare />);
    expect(quiet.queryAllByText("0").length).toBe(0);
    quiet.unmount();

    render(<FeedEngagement {...defaultProps} bare commentsCount={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("keeps its zeros where there is room for them", () => {
    render(<FeedEngagement {...defaultProps} />);
    expect(screen.getAllByText("0").length).toBe(2);
  });

  // Hiding the count hides the popover's trigger with it, which is only ever
  // the case at zero likes — where there is nobody to list.
  it("still names its controls when the counts are gone", () => {
    render(<FeedEngagement {...defaultProps} bare isOwnPost />);
    expect(screen.getByRole("button", { name: /like/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /comment/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
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
