import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { RATING_FACTS_KEY, fetchRatingFacts, type RatingFact } from "./useRatingFacts";

export type SortConfig = {
  column: string;
  direction: "asc" | "desc";
};

export type AggregatedResult = {
  brand_id: string;
  brand_name: string;
  product_id: string;
  product_name: string;
  property_names?: string[] | null;
  is_barista?: boolean;
  flavor_names?: string[] | null;
  avg_rating: number;
  count: number;
  most_recent_date: string;
};

/** One row per product, averaged from its ratings. */
const groupByProduct = (facts: RatingFact[]): AggregatedResult[] => {
  const products = new Map<string, AggregatedResult>();

  for (const fact of facts) {
    if (!fact.product_id) continue;

    let product = products.get(fact.product_id);
    if (!product) {
      product = {
        brand_id: "", // Deliberately not exposed by the anonymising RPC.
        brand_name: fact.brand_name || "Unknown Brand",
        product_id: fact.product_id,
        product_name: fact.product_name || "Unknown Product",
        property_names: fact.property_names ?? [],
        is_barista: fact.is_barista ?? false,
        flavor_names: fact.flavor_names ?? [],
        avg_rating: 0,
        count: 0,
        most_recent_date: fact.created_at || new Date().toISOString(),
      };
      products.set(fact.product_id, product);
    }

    product.avg_rating = (product.avg_rating * product.count + fact.rating) / (product.count + 1);
    product.count += 1;

    const seenAt = fact.created_at || new Date().toISOString();
    if (new Date(seenAt) > new Date(product.most_recent_date)) product.most_recent_date = seenAt;
  }

  return [...products.values()];
};

const sortProducts = (results: AggregatedResult[], { column, direction }: SortConfig): AggregatedResult[] => {
  const compare = (a: AggregatedResult, b: AggregatedResult) => {
    switch (column) {
      case "brand_name":
        return (a.brand_name || "").localeCompare(b.brand_name || "");
      case "product_name":
        return (a.product_name || "").localeCompare(b.product_name || "");
      case "avg_rating":
        return a.avg_rating - b.avg_rating;
      case "count":
        return a.count - b.count;
      case "created_at":
      case "most_recent_date":
        return new Date(a.most_recent_date).getTime() - new Date(b.most_recent_date).getTime();
      default:
        return 0;
    }
  };

  return [...results].sort((a, b) => (direction === "asc" ? compare(a, b) : -compare(a, b)));
};

/**
 * The ranking's view of the data.
 *
 * Shares its query with `useRatingFacts` and only differs in `select`, so the
 * page makes one request no matter which view is open. Sorting lives in
 * `select` rather than the query key — it is a client-side reorder of rows
 * already in hand, and keying on it made every sort re-fetch the same rows.
 */
export const useAggregatedResults = (sortConfig: SortConfig) => {
  const select = useCallback(
    (facts: RatingFact[]) => sortProducts(groupByProduct(facts), sortConfig),
    // The object identity changes each render; its two values are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortConfig.column, sortConfig.direction],
  );

  return useQuery({ queryKey: RATING_FACTS_KEY, queryFn: fetchRatingFacts, select });
};
