/**
 * The results page's sort menu, shared between the desktop popover and the
 * mobile sheet so the two surfaces never drift out of sync.
 */

import { Calendar, Star, Building2, Package, Hash, type LucideIcon } from "lucide-react";
import type { SortConfig } from "@/hooks/useAggregatedResults";

export type SortOption = {
  column: string;
  direction: SortConfig["direction"];
  label: string;
};

export type SortCategory = {
  icon: LucideIcon;
  label: string;
  options: SortOption[];
};

export const SORT_CATEGORIES: SortCategory[] = [
  {
    icon: Star,
    label: "Score",
    options: [
      { column: "avg_rating", direction: "desc", label: "Highest score" },
      { column: "avg_rating", direction: "asc", label: "Lowest score" },
    ],
  },
  {
    icon: Hash,
    label: "Ratings",
    options: [
      { column: "count", direction: "desc", label: "Most rated" },
      { column: "count", direction: "asc", label: "Fewest ratings" },
    ],
  },
  {
    icon: Calendar,
    label: "Date",
    options: [
      { column: "most_recent_date", direction: "desc", label: "Newest first" },
      { column: "most_recent_date", direction: "asc", label: "Oldest first" },
    ],
  },
  {
    icon: Building2,
    label: "Brand",
    options: [
      { column: "brand_name", direction: "asc", label: "Brand A–Z" },
      { column: "brand_name", direction: "desc", label: "Brand Z–A" },
    ],
  },
  {
    icon: Package,
    label: "Product",
    options: [
      { column: "product_name", direction: "asc", label: "Product A–Z" },
      { column: "product_name", direction: "desc", label: "Product Z–A" },
    ],
  },
];

export const findSortLabel = (sortConfig: SortConfig): string => {
  for (const category of SORT_CATEGORIES) {
    const found = category.options.find(
      (o) => o.column === sortConfig.column && o.direction === sortConfig.direction,
    );
    if (found) return found.label;
  }
  return "Sort";
};
