import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  totalTests: number;
  brandsCovered: number;
  activeMembers: number;
}

export const useHomeStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalTests: 0,
    brandsCovered: 0,
    activeMembers: 0,
  });

  useEffect(() => {
    const fetchTrustIndicators = async () => {
      try {
        const { data: statsData } = await supabase.rpc("get_public_stats");
        if (statsData && statsData.length > 0) {
          const stat = statsData[0];
          setStats({
            totalTests: Number(stat.total_tests) || 0,
            brandsCovered: Number(stat.total_brands) || 0,
            activeMembers: Number(stat.total_members) || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching trust indicators:", error);
      }
    };
    fetchTrustIndicators();
  }, []);

  return stats;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
};
