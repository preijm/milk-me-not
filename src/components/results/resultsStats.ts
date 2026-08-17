/**
 * Pure helpers for the results hero's headline numbers. Kept apart from any
 * component so nothing here trips the react-refresh "only export components"
 * rule for the files that do render JSX.
 */

import type { AggregatedResult } from "@/hooks/useAggregatedResults";
import { getTier } from "@/components/story";

export const formatCount = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : `${n}`;

export type CatalogueStats = {
  products: number;
  ratings: number;
  brands: number;
  gems: number;
};

export const computeCatalogueStats = (results: AggregatedResult[]): CatalogueStats => {
  const brandSet = new Set<string>();
  let ratings = 0;
  let gems = 0;

  for (const r of results) {
    if (r.brand_name) brandSet.add(r.brand_name);
    ratings += r.count;
    if (getTier(r.avg_rating).key === "gem") gems += 1;
  }

  return { products: results.length, ratings, brands: brandSet.size, gems };
};
