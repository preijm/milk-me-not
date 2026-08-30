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

/**
 * The RPC says "I am not telling you when" with the epoch, not with null.
 *
 * 248 of the 352 ratings it returns carry `1970-01-01T00:00:00+00:00`, which
 * is the anonymising function zeroing the timestamp rather than omitting it —
 * a rating's time is one of the few things that could tie it back to a person.
 * Read literally it means the board was busiest during the Apollo programme,
 * and the brand index duly printed "Jan 1970" against half its rows.
 *
 * So it is normalised here rather than at each call site: it is a fact about
 * this RPC, and every consumer already handles a missing date.
 */
const anonymisedDate = (value: string | null | undefined): string | null => {
  if (!value) return null;
  // Any year before the site existed is the sentinel, not a real rating.
  return value < "2000" ? null : value;
};

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
      created_at: anonymisedDate(row.created_at),
      country_code: row.country_code ?? null,
    }));
};

export const useRatingFacts = () =>
  useQuery({ queryKey: RATING_FACTS_KEY, queryFn: fetchRatingFacts });
