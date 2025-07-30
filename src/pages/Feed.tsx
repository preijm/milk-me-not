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
        <div className={`container max-w-2xl mx-auto px-4 py-6 md:py-8 pt-24 md:pt-32 pb-20 sm:pb-6 md:pb-8 relative z-10 transition-all duration-300 ${!user ? 'blur-sm pointer-events-none' : ''}`}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6 md:mb-8 text-center">Moo'd Board</h1>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {feedItems.map(item => <FeedItem key={item.id} item={item} />)}
              {feedItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No milk tests to show yet. Be the first to share your tasting!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Authentication Overlay - Only shown when not authenticated */}
        {!user && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
            <Card className="mx-4 w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border border-white/20">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-6">🥛</div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Join the Milk Community
                </h2>
                <p className="text-muted-foreground mb-8">
                  Sign in to discover milk alternatives, read reviews, and share your own tastings with the community.
                </p>
                <div className="space-y-4">
                  <Button 
                    onClick={() => navigate('/auth')} 
                    className="w-full" 
                    variant="brand"
                    size="lg"
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth')} 
                    variant="outline" 
                    className="w-full"
                    size="lg"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Create Account
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-6">
                  Already have an account? Click "Sign In" to access your profile.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </BackgroundPattern>
      <MobileFooter />
    </div>
  );
};
export default Feed;