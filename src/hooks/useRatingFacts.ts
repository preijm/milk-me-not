import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * One row per rating — the grain everything on the results page is built from.
 *
 * The ranking wants these folded into one row per product; the charts want the
 * individual scores that folding throws away. Both read this same query and
 * shape it with `select`, so the page fetches once however you look at it.
 */
export type RatingFact = {
  product_id: string | null;
  brand_name: string | null;
  product_name: string | null;
  rating: number;
  is_barista: boolean | null;
  price_quality_ratio: string | null;
  property_names: string[] | null;
  flavor_names: string[] | null;
  created_at: string | null;
  country_code: string | null;
};

/** Shared by every consumer, so React Query dedupes them onto one request. */
export const RATING_FACTS_KEY = ["milk-tests-facts"] as const;

export const fetchRatingFacts = async (): Promise<RatingFact[]> => {
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
      property_names: row.property_names ?? null,
      flavor_names: row.flavor_names ?? null,
      created_at: row.created_at ?? null,
      country_code: row.country_code ?? null,
    }));
};

export const useRatingFacts = () =>
  useQuery({ queryKey: RATING_FACTS_KEY, queryFn: fetchRatingFacts });
