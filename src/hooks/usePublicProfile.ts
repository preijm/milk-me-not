import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { inferPlantBase } from "@/lib/plantBase";
import { getTier } from "@/components/story";

export type PublicRating = {
  id: string;
  productId: string | null;
  brand: string;
  product: string;
  rating: number;
  notes: string | null;
  createdAt: string;
  priceQuality: string | null;
  drinkPreference: string | null;
};

export type PublicProfile = {
  id: string;
  username: string;
  avatarUrl: string | null;
  ratings: PublicRating[];
  total: number;
  average: number | null;
  best: PublicRating | null;
  worst: PublicRating | null;
  /** Month they logged their first rating — profiles_public exposes no join date. */
  since: string | null;
  /** The plant base they rate most, with how many. */
  favouriteBase: { label: string; count: number } | null;
  /** Their scores bucketed into the five named tiers. */
  spread: { key: string; name: string; color: string; count: number }[];
};

/**
 * A rater's public page.
 *
 * `profiles_public` gives the identity; `get_all_milk_tests` is the same
 * public RPC the feed uses and is the only source that carries `user_id`
 * alongside a rating, so the ratings are filtered from it client-side.
 */
export const usePublicProfile = (userId: string | undefined) =>
  useQuery<PublicProfile | null>({
    queryKey: ["public-profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null;

      // Public identity comes from a narrow RPC: the profiles table itself is
      // owner-only, so only id/username/avatar are ever exposed.
      const profileResult = await supabase.rpc("get_public_profile", { _user_id: userId }).maybeSingle();

      if (profileResult.error) throw profileResult.error;
      if (!profileResult.data) return null;


      // The RPC caps a page at 200 rows whatever page_limit asks for, so a
      // single call would silently under-report anyone whose ratings fall
      // outside the most recent window. Page until it runs dry.
      const PAGE = 200;
      const MAX_PAGES = 25;
      const rows: Awaited<ReturnType<typeof supabase.rpc<"get_all_milk_tests">>>["data"] = [];
      for (let page = 0; page < MAX_PAGES; page += 1) {
        const { data, error } = await supabase.rpc("get_all_milk_tests", {
          page_limit: PAGE,
          page_offset: page * PAGE,
        });
        if (error) throw error;
        if (!data || data.length === 0) break;
        rows.push(...data);
        if (data.length < PAGE) break;
      }

      const ratings: PublicRating[] = rows
        .filter((row) => row.user_id === userId)
        .filter((row) => new Date(row.created_at).getFullYear() !== 1970)
        .map((row) => ({
          id: row.id,
          productId: row.product_id ?? null,
          brand: row.brand_name || "Unknown brand",
          product: row.product_name || "Unknown product",
          rating: Number(row.rating) || 0,
          notes: row.notes ?? null,
          createdAt: row.created_at,
          priceQuality: row.price_quality_ratio ?? null,
          drinkPreference: row.drink_preference ?? null,
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const total = ratings.length;
      const average = total > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / total : null;

      const byScore = [...ratings].sort((a, b) => b.rating - a.rating);
      const oldest = ratings[ratings.length - 1];

      const baseCounts = new Map<string, number>();
      ratings.forEach((r) => {
        const base = inferPlantBase(`${r.brand} ${r.product}`);
        if (base.key === "blend") return;
        baseCounts.set(base.label, (baseCounts.get(base.label) ?? 0) + 1);
      });
      const favourite = [...baseCounts.entries()].sort((a, b) => b[1] - a[1])[0];

      const spreadMap = new Map<string, { key: string; name: string; color: string; count: number }>();
      ratings.forEach((r) => {
        const tier = getTier(r.rating);
        const existing = spreadMap.get(tier.name);
        if (existing) existing.count += 1;
        else spreadMap.set(tier.name, { key: tier.key, name: tier.name, color: tier.color, count: 1 });
      });

      return {
        id: profileResult.data.id as string,
        username: (profileResult.data.username as string) || "Someone",
        avatarUrl: (profileResult.data.avatar_url as string) ?? null,
        ratings,
        total,
        average,
        best: byScore[0] ?? null,
        worst: byScore[byScore.length - 1] ?? null,
        since: oldest
          ? new Date(oldest.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })
          : null,
        favouriteBase: favourite ? { label: favourite[0], count: favourite[1] } : null,
        spread: [...spreadMap.values()],
      };
    },
  });
