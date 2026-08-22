import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";
import { GROUND_CLASS } from "./grounds";

/**
 * The feed and the rankings put a member on one continuous ground below `lg`
 * by passing `bg-story-cream lg:bg-story-paper` to a Band already carrying
 * `ground="paper"`. That only works if tailwind-merge drops the Band's own
 * background for the override while keeping the `lg:` variant, which is a
 * quiet assumption to hang a visual rule on — a silent merge failure would
 * bring back the seam with nothing failing.
 */
describe("overriding a Band ground responsively", () => {
  const merged = cn(GROUND_CLASS.paper, "bg-story-cream lg:bg-story-paper");
  const classes = merged.split(" ");

  it("lets the override win at the base breakpoint", () => {
    expect(classes).toContain("bg-story-cream");
    expect(classes).not.toContain("bg-story-paper");
  });

  it("keeps the lg variant, so desktop still gets the white band", () => {
    expect(classes).toContain("lg:bg-story-paper");
  });

  it("leaves the ground's text colour alone", () => {
    expect(classes).toContain("text-story-ink");
  });

  it("changes nothing when no override is passed", () => {
    expect(cn(GROUND_CLASS.paper, undefined).split(" ")).toContain("bg-story-paper");
  });
});
