import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MilkTestResult } from "@/types/milk-test";

export type SortConfig = {
  column: string;
  direction: 'asc' | 'desc';
};

export const useUserMilkTests = (sortConfig: SortConfig) => {
  return useQuery({
    queryKey: ['my-milk-tests', sortConfig],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }
      
      // Cast to unknown first, then to our specific type
      const { data, error } = await supabase
        .from('milk_tests_view')
        .select('*')
        .eq('user_id', user.id)
        .order(sortConfig.column, { ascending: sortConfig.direction === 'asc' }) as unknown as {
          data: MilkTestResult[] | null,
          error: Error | null
        };
      
      if (error) throw error;
      return data || [];
    }
  });
};
