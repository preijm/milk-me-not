import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobileOrTablet } from "@/hooks/use-mobile";
import { useHighlightScroll } from "@/hooks/useHighlightScroll";
import { Band, SectionHead, StoryLayout } from "@/components/story";
import { FeedHero } from "@/components/feed/FeedHero";
import { FeedPullQuote } from "@/components/feed/FeedPullQuote";
import { FeedContent } from "@/components/feed/FeedContent";
import { MilkTestResult } from "@/types/milk-test";

const Feed = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const highlightTestId = searchParams.get("testId");
  const isMobileOrTablet = useIsMobileOrTablet();

  const { data: feedItems = [], isLoading } = useQuery({
    queryKey: ["feed", user?.id || "anonymous"],
    queryFn: async () => {
      // Signed-in readers get the full recent stream; strangers get enough of
      // it to be sold on the community without the query becoming unbounded.
      const limit = user ? 50 : 12;
      const { data, error } = await supabase.rpc("get_all_milk_tests", {
        page_limit: limit,
        page_offset: 0,
      });
      if (error) throw error;

      // Filter out posts from 1970 (invalid dates)
      const validData = (data || []).filter((item) => {
        const year = new Date(item.created_at).getFullYear();
        return year !== 1970;
      });

      return validData as MilkTestResult[];
    },
  });

  // Scroll to specific test when coming from notification
  useHighlightScroll({
    targetId: highlightTestId,
    idPrefix: "test-",
    enabled: feedItems.length > 0,
  });

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

  return (
    <StoryLayout mobileCtaHint="Add the one you tried today.">
      <Seo
        title="Feed — Latest plant-milk reviews | Milk Me Not"
        description="The latest community taste tests of plant-based milks — photos, ratings and notes from real reviewers."
        path="/feed"
      />

      <FeedHero items={feedItems} isLoading={isLoading} isAuthenticated={!!user} />

      {/* Desktop only for a member. It is real content rather than pitch — one
          verdict set at editorial scale — but it is also 310px showing an item
          that appears again in the stream a moment later, and on a phone that
          is the last thing between someone and the feed they opened. */}
      {!isLoading && feedItems.length > 0 && (
        <FeedPullQuote items={feedItems} className={user ? "hidden lg:block" : undefined} />
      )}

      <Band ground="paper" size={user ? "sm" : "lg"}>
        {/* Signposting for a first-time reader; 148px of it for a member who
            opened the feed to read the feed. The compact page head above has
            already said what this is. */}
        {!user && (
          <SectionHead
            kicker="The stream"
            title="Every carton, in the order it was opened"
            lede="No filters, no curation — this is what the community is actually drinking, right now."
            size="md"
          />
        )}

        <div className={user ? "" : "mt-8"}>
          <FeedContent
            items={feedItems}
            isLoading={isLoading}
            isAuthenticated={!!user}
            variant={isMobileOrTablet ? "mobile" : "desktop"}
          />
        </div>
      </Band>
    </StoryLayout>
  );
};

export default Feed;
