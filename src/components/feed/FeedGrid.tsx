import Masonry from "react-masonry-css";
import { FeedItem } from "./FeedItem";
import { MilkTestResult } from "@/types/milk-test";

interface FeedGridProps {
  items: MilkTestResult[];
}

const breakpointColumns = { default: 3, 1279: 2 };

/**
 * Desktop composition: a masonry wall. Verdict cards vary in height — a
 * photo, a note, a barista tag, all optional — so a rigid grid would either
 * waste the width in gutters or force every card to the tallest one's height.
 */
export const FeedGrid = ({ items }: FeedGridProps) => (
  <Masonry breakpointCols={breakpointColumns} className="flex -ml-5 w-auto" columnClassName="space-y-5 pl-5">
    {items.map((item) => (
      <FeedItem key={item.id} item={item} />
    ))}
  </Masonry>
);
