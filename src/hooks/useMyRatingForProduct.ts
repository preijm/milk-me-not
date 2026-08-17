import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MilkTestResult } from "@/types/milk-test";
import { useAuth } from "@/contexts/AuthContext";

export const MY_RATING_KEY = "my-rating-for-product";

/**
 * The signed-in reader's own rating of one product, if they have left one.
 *
 * Nothing in the schema stops the same person rating the same carton twice —
 * the only unique constraint in the migrations is on likes — and nothing in the
 * insert path checked. That was survivable while rating meant finding the
 * product through a search form; it is a one-tap mistake from a product page,
 * so the quick-rate sheet asks first and updates the existing row instead.
 */
export const useMyRatingForProduct = (productId: string | null | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: [MY_RATING_KEY, productId, user?.id],
    enabled: !!productId && !!user?.id,
    queryFn: async (): Promise<MilkTestResult | null> => {
      const { data, error } = (await supabase
        .from("milk_tests_private_view" as never)
        .select("*")
        .eq("user_id", user!.id)
        .eq("product_id", productId!)
        .order("created_at", { ascending: false })
        .limit(1)) as unknown as { data: MilkTestResult[] | null; error: Error | null };

      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
};
