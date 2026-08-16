import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type LeaderboardEntry = {
  productId: string;
  brand: string;
  product: string;
  score: number;
  ratings: number;
  base: string;
};

export type HomeStory = {
  totalRatings: number;
  brands: number;
  products: number;
  ratingsThisWeek: number;
  leaderboard: LeaderboardEntry[];
  /** How many products carry at least one rating in each base. */
  baseCounts: Record<string, number>;
};

const BASE_WORDS = ["oat", "almond", "soy", "coconut", "rice", "hazelnut", "pea", "cashew"];

/** Infer the plant base from the product/brand name — the catalogue has no base column. */
const inferBase = (productName: string, properties: string[] | null | undefined): string => {
  const haystack = `${productName} ${(properties ?? []).join(" ")}`.toLowerCase();
  const hit = BASE_WORDS.find((w) => haystack.includes(w));
  if (hit === "soy" || haystack.includes("soya")) return "soy";
  return hit ?? "blend";
};

/**
 * Everything the homepage needs in one round trip: the headline counts and the
 * real leaderboard. The homepage sells the community, so the numbers on it have
 * to be the community's actual numbers.
 */
export const useStoryHome = () =>
  useQuery<HomeStory>({
    queryKey: ["story-home"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [statsResult, recentResult, aggregatedResult] = await Promise.all([
        supabase.rpc("get_public_stats"),
        supabase
          .from("milk_tests")
          .select("id", { count: "exact", head: true })
          .gte("created_at", sevenDaysAgo.toISOString()),
        supabase.rpc("get_aggregated_milk_tests"),
      ]);

      const stat = statsResult.data?.[0];

      // Aggregate the raw ratings into a per-product average, same shape the
      // results page uses, then keep the well-supported top of the table.
      const byProduct = new Map<
        string,
        { brand: string; product: string; total: number; count: number; properties: string[] }
      >();

      (aggregatedResult.data ?? []).forEach((row) => {
        if (!row.product_id) return;
        const entry = byProduct.get(row.product_id) ?? {
          brand: row.brand_name || "Unknown brand",
          product: row.product_name || "Unknown product",
          total: 0,
          count: 0,
          properties: row.property_names ?? [],
        };
        entry.total += row.rating ?? 0;
        entry.count += 1;
        byProduct.set(row.product_id, entry);
      });

      const scored: LeaderboardEntry[] = Array.from(byProduct.entries())
        .filter(([, v]) => v.count > 0)
        .map(([productId, v]) => ({
          productId,
          brand: v.brand,
          product: v.product,
          score: v.total / v.count,
          ratings: v.count,
          base: inferBase(`${v.brand} ${v.product}`, v.properties),
        }));

      const baseCounts: Record<string, number> = {};
      scored.forEach((entry) => {
        baseCounts[entry.base] = (baseCounts[entry.base] ?? 0) + 1;
      });

      // Rank by score, but require corroboration so a lone 10.0 cannot top the
      // board ahead of a product a dozen people agree on.
      const leaderboard = scored
        .filter((e) => e.ratings >= 2)
        .sort((a, b) => b.score - a.score || b.ratings - a.ratings)
        .slice(0, 6);

      return {
        totalRatings: Number(stat?.total_tests) || 0,
        brands: Number(stat?.total_brands) || 0,
        products: Number(stat?.total_products) || 0,
        ratingsThisWeek: recentResult.count ?? 0,
        leaderboard: leaderboard.length > 0 ? leaderboard : scored.sort((a, b) => b.score - a.score).slice(0, 6),
        baseCounts,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
