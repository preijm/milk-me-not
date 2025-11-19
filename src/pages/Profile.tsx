import React from "react";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import { User, Settings, Shield, Heart, PlusCircle, ListPlus, ChevronRight, LogOut, TrendingUp } from "lucide-react";
import BackgroundPattern from "@/components/BackgroundPattern";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserMilkTests } from "@/hooks/useUserMilkTests";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Profile = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { data: milkTests = [] } = useUserMilkTests({ column: 'created_at', direction: 'desc' });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
      description: "See you soon!",
    });
    navigate("/");
  };

  // Calculate stats
  const totalTests = milkTests.length;
  const avgRating = totalTests > 0 
    ? (milkTests.reduce((sum, test) => sum + Number(test.rating), 0) / totalTests).toFixed(1)
    : "0.0";
  const memberSince = profile?.created_at 
    ? format(new Date(profile.created_at), 'MMM yyyy')
    : "Recently";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <MenuBar />
      <BackgroundPattern>
        <div className="min-h-screen pt-16 pb-24 sm:pb-12">
          <div className="container max-w-4xl mx-auto px-4 py-6 sm:py-8 relative z-10 space-y-6">
            
            {/* Profile Header */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                    <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                      {profile?.username || "User"}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Stats */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 text-foreground">Your Activity</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                    <TrendingUp className="w-5 h-5 text-primary mb-2" />
                    <p className="text-2xl font-bold text-foreground">{totalTests}</p>
                    <p className="text-xs text-muted-foreground">Tests</p>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                    <Heart className="w-5 h-5 text-primary mb-2" />
                    <p className="text-2xl font-bold text-foreground">{avgRating}</p>
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 col-span-2 sm:col-span-2">
                    <User className="w-5 h-5 text-primary mb-2" />
                    <p className="text-sm font-bold text-foreground">Member since</p>
                    <p className="text-xs text-muted-foreground">{memberSince}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 text-foreground">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => navigate("/my-results")}
                  >
                    <ListPlus className="w-5 h-5 text-primary" />
                    <span className="text-xs sm:text-sm">My Tests</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => navigate("/add")}
                  >
                    <PlusCircle className="w-5 h-5 text-primary" />
                    <span className="text-xs sm:text-sm">Add Test</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex-col gap-2 col-span-2 sm:col-span-1"
                    onClick={() => navigate("/wishlist")}
                  >
                    <Heart className="w-5 h-5 text-primary" />
                    <span className="text-xs sm:text-sm">Wishlist</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 text-foreground">Settings</h2>
                <div className="space-y-2">
                  <Link 
                    to="/account"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-foreground font-medium">Account Settings</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>

                  <Link 
                    to="/account/security"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-foreground font-medium">Security</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>

                  <div className="pt-4 border-t mt-4">
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </BackgroundPattern>
      <MobileFooter />
    </div>
  );
};

export default Profile;
