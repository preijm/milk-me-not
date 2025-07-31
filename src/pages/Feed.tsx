import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPattern from "@/components/BackgroundPattern";
import { FeedItem } from "@/components/feed/FeedItem";
import { MilkTestResult } from "@/types/milk-test";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader, LogIn, UserPlus } from "lucide-react";
const Feed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
    },
    enabled: !!user // Only fetch if user is authenticated
  });

  return (
    <div className="min-h-screen relative">
      <MenuBar />
      <BackgroundPattern>
        {/* Main Content - Always rendered but blurred when not authenticated */}
        <div className={`container max-w-2xl mx-auto px-4 py-6 md:py-8 pt-24 md:pt-32 pb-20 sm:pb-6 md:pb-8 relative z-10 transition-all duration-300 ${!user ? 'pointer-events-none' : ''}`}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6 md:mb-8 text-center">Moo'd Board</h1>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {feedItems.map(item => <FeedItem key={item.id} item={item} />)}
              {feedItems.length === 0 && (
                <div className="text-center py-8">
                  {user ? (
                    <p className="text-muted-foreground">No milk tests to show yet. Be the first to share your tasting!</p>
                  ) : (
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="text-lg">🥛✨</div>
                      <h3 className="text-xl font-semibold text-foreground">The community is buzzing with amazing milk alternative discoveries!</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Members are sharing detailed reviews, uploading mouth-watering photos, rating products out of 10, and having lively discussions in the comments. 
                      </p>
                      <p className="text-foreground font-medium">
                        Join our community to see what everyone's raving about, discover your next favorite alternative, and share your own tastings!
                      </p>
                      <div className="text-lg">🚀</div>
                      <p className="text-sm text-muted-foreground font-medium">
                        Sign in now to unlock the full Moo'd Board experience
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </BackgroundPattern>
      <MobileFooter />
    </div>
  );
};
export default Feed;