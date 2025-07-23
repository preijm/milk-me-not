import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserProfile = () => {
  const [isLoading, setIsLoading] = useState(true);

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, default_country_code')
        .eq('id', user.id)
        .maybeSingle();

      return profile;
    },
    enabled: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoading(!user);
    };
    checkAuth();
  }, []);

  return {
    profile,
    isLoading,
    refetchProfile,
  };
};