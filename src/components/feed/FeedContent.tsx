import React from "react";
import { Loader } from "lucide-react";
import { MilkTestResult } from "@/types/milk-test";
import { FeedGrid } from "./FeedGrid";
import { FeedLoginPrompt } from "./FeedLoginPrompt";
import { FeedEmptyState } from "./FeedEmptyState";

interface FeedContentProps {
  items: MilkTestResult[];
  isLoading: boolean;
  isAuthenticated: boolean;
  variant: "mobile" | "desktop";
}

export const FeedContent = ({
  items,
  isLoading,
  isAuthenticated,
  variant,
}: FeedContentProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const gridClassName =
    variant === "desktop" ? "flex gap-6" : "flex justify-center w-full";

  return (
    <>
      {items.length > 0 ? (
        <>
          <FeedGrid
            items={items}
            isAuthenticated={isAuthenticated}
            variant={variant}
          />

          {!isAuthenticated && <FeedLoginPrompt className="mt-6" />}
        </>
      ) : (
        <FeedEmptyState isAuthenticated={isAuthenticated} />
      )}
    </>
  );
};
