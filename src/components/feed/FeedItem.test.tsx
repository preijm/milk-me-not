import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { MilkTestResult } from "@/types/milk-test";

// The card's behaviour — likes, comments, routing — lives in this hook and is
// covered where it lives. What is under test here is the composition.
vi.mock("./useFeedItemState", () => ({
  useFeedItemState: () => ({
    user: null,
    isOwnPost: false,
    likes: [],
    comments: [],
    isLiked: false,
    showComments: false,
    setShowComments: () => {},
    likeMutation: { isPending: false },
    commentMutation: { isPending: false },
    handleLike: () => {},
    handleComment: () => {},
    handleEdit: () => {},
  }),
}));

const { FeedItem } = await import("./FeedItem");

const item = {
  id: "t1",
  product_id: "p1",
  rating: 9.3,
  username: "ilva",
  created_at: "2026-08-01T00:00:00Z",
  brand_name: "Joya",
  product_name: "Oat",
  is_barista: true,
  picture_path: "shot.jpg",
  notes: "Very creamy and a bit sweet",
  property_names: [],
  flavor_names: [],
} as unknown as MilkTestResult;

const renderCard = (overrides: Partial<MilkTestResult> = {}) =>
  render(
    <MemoryRouter>
      <FeedItem item={{ ...item, ...overrides }} />
    </MemoryRouter>,
  );

describe("FeedItem", () => {
  it("scores the carton once, not four times over", () => {
    // 9.3, the word GEM and the green they are both printed in are one mark.
    // "Buy two." underneath was a fourth statement of the same fact, and it
    // repeated down a masonry column — every card above 8 carried it.
    renderCard();
    expect(screen.getByText("9.3")).toBeInTheDocument();
    expect(screen.getByText("Gem")).toBeInTheDocument();
    expect(screen.queryByText("Buy two.")).toBeNull();
  });

  it("keeps the blurb out of the lower tiers too", () => {
    renderCard({ rating: 6.7 } as Partial<MilkTestResult>);
    expect(screen.queryByText("Worth the shelf space.")).toBeNull();
  });

  it("puts the carton and the picture of it in one block", () => {
    // They used to sit in the card's single 16px rhythm alongside the byline,
    // the note and the engagement row, so the name read as one more strip
    // rather than as the caption to the photo directly under it.
    const { container } = renderCard();
    const link = container.querySelector('a[href="/product/p1"]');
    const photo = container.querySelector("button > img");
    expect(link).not.toBeNull();
    expect(photo).not.toBeNull();

    const block = link?.parentElement;
    expect(block?.contains(photo!)).toBe(true);
    expect(block?.className).toContain("overflow-hidden");

    // …and the block is not the card itself, which would make the grouping
    // meaningless.
    const card = container.querySelector("article");
    expect(block).not.toBe(card);
    expect(card?.contains(block!)).toBe(true);
  });

  it("groups a card with no photo the same way", () => {
    // The placeholder is still the picture slot; it belongs in the block.
    const { container } = renderCard({ picture_path: null } as Partial<MilkTestResult>);
    const link = container.querySelector('a[href="/product/p1"]');
    const block = link?.parentElement;
    // Not the article: unwrapping the block would satisfy the line below by
    // accident, since the placeholder is inside the card either way.
    expect(block).not.toBe(container.querySelector("article"));
    expect(block?.textContent).toContain("No photo this time");
  });

  it("leaves the note and the engagement row outside the block", () => {
    // The gap around the block has to stay wider than the gap inside it, which
    // only works if the note is a sibling rather than a third child.
    const { container } = renderCard();
    const link = container.querySelector('a[href="/product/p1"]');
    const block = link?.parentElement;
    expect(block?.textContent).not.toContain("Very creamy");
  });
});
