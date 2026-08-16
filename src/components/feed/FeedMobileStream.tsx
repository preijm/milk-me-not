import { FeedMobileCard } from "./FeedMobileCard";
import { MilkTestResult } from "@/types/milk-test";

interface FeedMobileStreamProps {
  items: MilkTestResult[];
}

/**
 * Mobile composition: a dense, purpose-built card (see `FeedMobileCard`),
 * not the desktop card narrowed into one column. Tighter vertical rhythm
 * than the desktop grid's gutters — a feed built to scroll with a thumb.
 */
export const FeedMobileStream = ({ items }: FeedMobileStreamProps) => (
  <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
    {items.map((item) => (
      <FeedMobileCard key={item.id} item={item} />
    ))}
  </div>
);
