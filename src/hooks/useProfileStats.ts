import { useMemo } from "react";
import { format } from "date-fns";
import { MilkTestResult } from "@/types/milk-test";

interface Profile {
  created_at?: string;
}

interface ProfileStats {
  totalTests: number;
  avgRating: string;
  bestScore: number;
  memberSince: string;
}

export function useProfileStats(
  milkTests: MilkTestResult[],
  profile: Profile | null | undefined
): ProfileStats {
  // Read the one field this depends on up front. Depending on
  // `profile?.created_at` inside the array while the body reads `profile` makes
  // the declared and inferred dependencies disagree, which stops the compiler
  // preserving the memo at all.
  const createdAt = profile?.created_at;

  return useMemo(() => {
    const totalTests = milkTests.length;
    
    const avgRating =
      totalTests > 0
        ? (
            milkTests.reduce((sum, test) => sum + Number(test.rating), 0) /
            totalTests
          ).toFixed(1)
        : "0.0";

    const bestScore = totalTests > 0
      ? Math.max(...milkTests.map(t => Number(t.rating)))
      : 0;
    
    const memberSince = createdAt
      ? format(new Date(createdAt), "MMM yyyy")
      : "Recently";

    return { totalTests, avgRating, bestScore, memberSince };
  }, [milkTests, createdAt]);
}
