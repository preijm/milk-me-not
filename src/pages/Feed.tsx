import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPattern from "@/components/BackgroundPattern";
import { FeedItem } from "@/components/feed/FeedItem";
import { MilkTestResult } from "@/types/milk-test";
import { Loader } from "lucide-react";
const Feed = () => {
  const {
    data: feedItems = [],
    isLoading
  } = useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('milk_tests_view').select('*').order('created_at', {
        ascending: false
      }).limit(50);
      if (error) throw error;
      return data as MilkTestResult[];
    }
  });
  return <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="container max-w-2xl mx-auto px-4 py-6 md:py-8 pt-24 md:pt-32 pb-20 sm:pb-6 md:pb-8 relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6 md:mb-8 text-center">Moo'd Board </h1>
          
          {isLoading ? <div className="flex items-center justify-center py-8">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div> : <div className="space-y-6">
              {feedItems.map(item => <FeedItem key={item.id} item={item} />)}
              {feedItems.length === 0 && <div className="text-center py-8 text-muted-foreground">
                  No milk tests to show yet. Be the first to share your tasting!
                </div>}
            </div>}
        </div>
      </BackgroundPattern>
      <MobileFooter />
    </div>;
};
export default Feed;