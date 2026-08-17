import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * One row per rating — the grain the charts need.
 *
 * `useAggregatedResults` folds these same rows into one row per product, which
 * is right for the ranking but throws away the individual scores. A spread, a
 * distribution and a price ladder all need the ratings themselves, so the
 * charts read the source rows instead.
 */
export type RatingFact = {
  product_id: string | null;
  brand_name: string | null;
  product_name: string | null;
  rating: number;
  is_barista: boolean | null;
  price_quality_ratio: string | null;
};

export const useRatingFacts = () =>
  useQuery({
    queryKey: ["milk-tests-facts"],
    queryFn: async (): Promise<RatingFact[]> => {
      const { data, error } = await supabase.rpc("get_aggregated_milk_tests");
      if (error) throw error;
      return (data ?? [])
        .filter((row) => typeof row.rating === "number" && !Number.isNaN(row.rating))
        .map((row) => ({
          product_id: row.product_id ?? null,
          brand_name: row.brand_name ?? null,
          product_name: row.product_name ?? null,
          rating: row.rating,
          is_barista: row.is_barista ?? null,
          price_quality_ratio: row.price_quality_ratio ?? null,
        }));
    },
  });
