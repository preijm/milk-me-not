import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPattern from "@/components/BackgroundPattern";
import { FeedContent } from "@/components/feed/FeedContent";
import { MilkTestResult } from "@/types/milk-test";
import { useIsMobileOrTablet } from "@/hooks/use-mobile";
import { useHighlightScroll } from "@/hooks/useHighlightScroll";

const Feed = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const highlightTestId = searchParams.get("testId");

  const { data: feedItems = [], isLoading } = useQuery({
    queryKey: ["feed", user?.id || "anonymous"],
    queryFn: async () => {
      // For social feed, show all users' tests with their details using security definer function
      const { data, error } = await supabase.rpc("get_all_milk_tests");
      if (error) throw error;

      // Filter out posts from 1970 (invalid dates)
      const validData = (data || []).filter((item) => {
        const year = new Date(item.created_at).getFullYear();
        return year !== 1970;
      });

      // Sort by created_at descending (newest first)
      const sortedData = validData.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });

      // Limit the results based on authentication status
      const limitedData = sortedData.slice(0, user ? 50 : 6);
      return limitedData as MilkTestResult[];
    },
  });

  // Scroll to specific test when coming from notification
  useHighlightScroll({
    targetId: highlightTestId,
    idPrefix: "test-",
    enabled: feedItems.length > 0,
  });

  const isMobileOrTablet = useIsMobileOrTablet();

  // Preload feed images so full-page screenshots (Edge) capture already-loaded assets.
  useEffect(() => {
    const picturePaths = feedItems
      .map((i) => i.picture_path)
      .filter((p): p is string => !!p);

    // Dedupe to avoid unnecessary requests
    const uniquePaths = Array.from(new Set(picturePaths));

    uniquePaths.forEach((picturePath) => {
      const url = `https://jtabjndnietpewvknjrm.supabase.co/storage/v1/object/public/milk-pictures/${encodeURIComponent(picturePath)}`;
      const img = new Image();
      img.decoding = "sync";
      img.src = url;
    });
  }, [feedItems]);

  // Mobile/Tablet layout with white background
  if (isMobileOrTablet) {
    return (
      <div className="min-h-screen bg-white">
        <MenuBar />
        <div className="pt-16 pb-28 min-h-screen">
          <div className="container max-w-7xl mx-auto px-4 py-6">
            <FeedContent
              items={feedItems}
              isLoading={isLoading}
              isAuthenticated={!!user}
              variant="mobile"
            />
          </div>
        </div>
        <MobileFooter />
      </div>
    );
  }

  // Desktop layout with BackgroundPattern
  return (
    <div className="min-h-screen relative">
      <MenuBar />
      <BackgroundPattern>
        <div className="container max-w-7xl mx-auto px-4 py-6 md:py-8 pt-24 md:pt-32 pb-20 sm:pb-6 md:pb-8 relative z-10 transition-all duration-300">
          <FeedContent
            items={feedItems}
            isLoading={isLoading}
            isAuthenticated={!!user}
            variant="desktop"
          />
        </div>
      </BackgroundPattern>
      <MobileFooter />
    </div>
  );
};

export default Feed;
