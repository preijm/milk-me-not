import { useMemo } from "react";
import { format } from "date-fns";
import { MilkTestResult } from "@/types/milk-test";

interface Profile {
  created_at?: string;
}

interface ProfileStats {
  totalTests: number;
  avgRating: string;
  memberSince: string;
}

export function useProfileStats(
  milkTests: MilkTestResult[],
  profile: Profile | null | undefined
): ProfileStats {
  return useMemo(() => {
    const totalTests = milkTests.length;
    
    const avgRating =
      totalTests > 0
        ? (
            milkTests.reduce((sum, test) => sum + Number(test.rating), 0) /
            totalTests
          ).toFixed(1)
        : "0.0";
    
    const memberSince = profile?.created_at
      ? format(new Date(profile.created_at), "MMM yyyy")
      : "Recently";

    return { totalTests, avgRating, memberSince };
  }, [milkTests, profile?.created_at]);
}
