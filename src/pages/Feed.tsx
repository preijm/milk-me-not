import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPattern from "@/components/BackgroundPattern";
import { FeedItem } from "@/components/feed/FeedItem";
import { MilkTestResult } from "@/types/milk-test";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader, LogIn, UserPlus } from "lucide-react";
const Feed = () => {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightTestId = searchParams.get('testId');
  const {
    data: feedItems = [],
    isLoading
  } = useQuery({
    queryKey: ['feed', user?.id || 'anonymous'],
    queryFn: async () => {
      // For social feed, show all users' tests with their details using security definer function
      const {
        data,
        error
      } = await supabase.rpc('get_all_milk_tests');
      if (error) throw error;

      // Limit the results based on authentication status
      const limitedData = (data || []).slice(0, user ? 50 : 3);
      return limitedData as MilkTestResult[];
    }
  });

  // Scroll to specific test when coming from notification
  useEffect(() => {
    if (highlightTestId && feedItems.length > 0) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`test-${highlightTestId}`);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          // Add a temporary highlight effect using brand blue
          element.classList.add('ring-2', 'ring-[hsl(var(--brand-blue))]', 'ring-offset-2');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-[hsl(var(--brand-blue))]', 'ring-offset-2');
          }, 3000);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [highlightTestId, feedItems]);
  return <div className="min-h-screen relative">
      <MenuBar />
      <BackgroundPattern>
        {/* Main Content */}
        <div className={`container max-w-2xl mx-auto px-4 py-6 md:py-8 pt-24 md:pt-32 pb-20 sm:pb-6 md:pb-8 relative z-10 transition-all duration-300`}>
          
          
          {isLoading ? <div className="flex items-center justify-center py-8">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div> : <div className="space-y-6">
              {feedItems.map(item => <FeedItem key={item.id} item={item} blurred={!user} disabled={!user} />)}
              
              {/* Login prompt for non-authenticated users after preview items */}
              {!user && feedItems.length > 0 && <Card className="w-full shadow-lg border-2 border-primary/20">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className="text-2xl">🔓</div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-foreground">Ready to see more?</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Join our community to unlock all reviews, leave comments, and share your own taste tests!
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button onClick={() => navigate('/auth', {
                    state: {
                      from: '/feed'
                    }
                  })} variant="brand" className="border-0" size="lg" style={{
                    backgroundColor: '#2144ff',
                    color: 'white'
                  }}>
                          <LogIn className="mr-2 h-4 w-4" />
                          Log In
                        </Button>
                        <Button onClick={() => navigate('/auth', {
                    state: {
                      from: '/feed',
                      mode: 'signup'
                    }
                  })} variant="outline" size="lg">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Sign Up
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>}
              
              {feedItems.length === 0 && <div className="text-center py-8">
                  {user ? <p className="text-muted-foreground">No milk tests to show yet. Be the first to share your tasting!</p> : <div className="max-w-md mx-auto space-y-4">
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
                    </div>}
                </div>}
            </div>}
        </div>

      </BackgroundPattern>
      <MobileFooter />
    </div>;
};
export default Feed;