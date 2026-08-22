import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserMark } from "./UserMark";
import { markFor, MARK_TONES } from "./userMarkTone";

/**
 * The colour has to be a pure function of the name. If it drifted — by render
 * order, by a random seed, by anything per-session — the same person would wear
 * a different colour on the feed than in your notifications, which is worse
 * than the single black disc this replaced.
 */
describe("markFor", () => {
  it("gives the same name the same tone every time", () => {
    expect(markFor("ilva")).toBe(markFor("ilva"));
  });

  it("ignores case and surrounding space", () => {
    expect(markFor("  Ilva ")).toBe(markFor("ilva"));
  });

  it("separates the names that sit next to each other in a real list", () => {
    expect(markFor("Ilva")).not.toBe(markFor("Olivier"));
  });

  it("uses the whole palette rather than favouring one end", () => {
    const names = ["anna", "bob", "carla", "dmitri", "elena", "finn", "greta", "hugo", "iris", "jonas", "klaas", "lotte"];
    const used = new Set(names.map((n) => markFor(n).bg));
    expect(used.size).toBeGreaterThanOrEqual(4);
  });

  it("still returns a tone for a missing name", () => {
    expect(MARK_TONES).toContain(markFor(undefined));
    expect(MARK_TONES).toContain(markFor(""));
  });
});

describe("UserMark", () => {
  it("shows one initial by default", () => {
    render(<UserMark name="ilva" />);
    expect(screen.getByText("I")).toBeInTheDocument();
  });

  it("shows two when asked, for a profile header", () => {
    render(<UserMark name="ilva" letters={2} />);
    expect(screen.getByText("IL")).toBeInTheDocument();
  });

  // Every call site did this before the component existed, and FeedHeader
  // asserts it.
  it("falls back to U for an unknown user", () => {
    render(<UserMark name={undefined} />);
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("carries the tone for the name", () => {
    const { container } = render(<UserMark name="ilva" />);
    const tone = markFor("ilva");
    expect(container.firstElementChild).toHaveClass(tone.bg, tone.fg);
  });

  it("is decorative — the name is already in the row beside it", () => {
    const { container } = render(<UserMark name="ilva" />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});
