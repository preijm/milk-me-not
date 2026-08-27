import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobileOrTablet } from "@/hooks/use-mobile";
import { useHighlightScroll } from "@/hooks/useHighlightScroll";
import { Band, SectionHead, StoryLayout } from "@/components/story";
import { cn } from "@/lib/utils";
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

  // There was a preload here that fetched every photo in the feed at once, so
  // that Edge's full-page screenshot would capture loaded images. It cost a
  // signed-in phone the entire feed up front — fifty originals, about 150MB —
  // to serve a screenshot tool. `FeedImage` loads thumbnails lazily now, which
  // is the opposite trade and the right one.

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

      {/* One ground the whole way down for a member on a phone.
          The compact head sits on cream and this band was paper, so a hard
          seam landed 106px into the page — on a desktop the same change of
          ground arrives after a tall hero and reads as editorial rhythm, but
          at that height it is just a stripe. Cards are white, so cream also
          gives them an edge they never had against paper. Desktop keeps the
          white band. */}
      <Band
        ground="paper"
        size={user ? "sm" : "lg"}
        className={cn(user && "bg-story-cream lg:bg-story-paper")}
      >
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
