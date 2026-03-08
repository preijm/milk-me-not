import React from "react";
import Masonry from "react-masonry-css";
import { FeedItem } from "./FeedItem";
import { MilkTestResult } from "@/types/milk-test";

interface FeedGridProps {
  items: MilkTestResult[];
  isAuthenticated: boolean;
  className?: string;
  variant?: "mobile" | "desktop";
}

const breakpointColumns = {
  default: 3,
  1023: 2,
  639: 1,
};

export const FeedGrid = ({ items, isAuthenticated, className, variant = "desktop" }: FeedGridProps) => {
  const masonryClassName = variant === "mobile" 
    ? "flex w-full justify-center" 
    : (className || "flex -ml-4 w-auto");
  
  const columnClass = variant === "mobile"
    ? "space-y-4 w-full max-w-md mx-auto"
    : "pl-4 space-y-4";

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className={masonryClassName}
      columnClassName={columnClass}
    >
      {items.map((item) => (
        <FeedItem
          key={item.id}
          item={item}
          blurred={!isAuthenticated}
          disabled={!isAuthenticated}
        />
      ))}
    </Masonry>
  );
};
