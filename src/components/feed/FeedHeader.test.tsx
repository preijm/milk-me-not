import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeedHeader } from "./FeedHeader";

describe("FeedHeader", () => {
  const defaultProps = {
    username: "TestUser",
    createdAt: new Date().toISOString(),
  };

  it("renders username", () => {
    render(<FeedHeader {...defaultProps} />);
    expect(screen.getByText("TestUser")).toBeInTheDocument();
  });

  it("renders first letter avatar badge", () => {
    render(<FeedHeader {...defaultProps} />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("renders 'U' when username is undefined", () => {
    render(<FeedHeader createdAt={defaultProps.createdAt} />);
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  // The byline used to end with the score, which put the same number twice on
  // one card — once at display size at the top and once here.
  it("leaves the score to the top of the card", () => {
    render(<FeedHeader {...defaultProps} />);
    expect(screen.queryByText("8.5")).not.toBeInTheDocument();
  });

  it("renders time ago text", () => {
    render(<FeedHeader {...defaultProps} />);
    // "less than a minute ago" or similar from date-fns
    expect(screen.getByText(/ago/i)).toBeInTheDocument();
  });

  it("applies blur-sm class when blurred", () => {
    render(<FeedHeader {...defaultProps} blurred />);
    const username = screen.getByText("TestUser");
    expect(username.className).toContain("blur-xs");
  });

  it("does not apply blur-sm class when not blurred", () => {
    render(<FeedHeader {...defaultProps} blurred={false} />);
    const username = screen.getByText("TestUser");
    expect(username.className).not.toContain("blur-xs");
  });
});
