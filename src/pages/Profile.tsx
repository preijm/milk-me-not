import React, { useState } from "react";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import { User, PlusCircle, ListPlus, LogOut, TrendingUp, Edit2 } from "lucide-react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";

const Profile = () => {
  const { user } = useAuth();
  const { profile, refetchProfile } = useUserProfile();
  const { data: milkTests = [] } = useUserMilkTests({ column: 'created_at', direction: 'desc' });
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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
        <div className="min-h-screen pt-16 pb-24 lg:pb-12">
          <div className="container max-w-6xl mx-auto px-4 py-6 sm:py-8 relative z-10">
            
            {/* Mobile/Tablet Layout (< lg) */}
            <div className="lg:hidden space-y-6">
              {/* Profile Header */}
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80">
                          <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-lg"
                        onClick={() => setEditDialogOpen(true)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
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
                      <TrendingUp className="w-5 h-5 text-primary mb-2" />
                      <p className="text-2xl font-bold text-foreground">{avgRating}</p>
                      <p className="text-xs text-muted-foreground">Avg Rating</p>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 col-span-2">
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
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => navigate("/results", { state: { myResultsOnly: true } })}
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
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Desktop Layout (>= lg) */}
            <div className="hidden lg:block space-y-6">
              {/* Profile Header - Desktop horizontal layout */}
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80">
                          <User className="w-12 h-12 text-primary-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full shadow-lg"
                        onClick={() => setEditDialogOpen(true)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-foreground">
                        {profile?.username || "User"}
                      </h1>
                      <p className="text-muted-foreground mt-1">{user?.email}</p>
                      <p className="text-sm text-muted-foreground mt-2">Member since {memberSince}</p>
                    </div>
                    <Button 
                      variant="destructive"
                      onClick={handleSignOut}
                      className="flex-shrink-0"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stats and Quick Actions - Side by side */}
              <div className="grid grid-cols-2 gap-6">
                {/* User Stats */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-6 text-foreground">Your Activity</h2>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                        <TrendingUp className="w-6 h-6 text-primary flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Total Tests</p>
                          <p className="text-2xl font-bold text-foreground">{totalTests}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                        <TrendingUp className="w-6 h-6 text-primary flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Average Rating</p>
                          <p className="text-2xl font-bold text-foreground">{avgRating}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-6 text-foreground">Quick Actions</h2>
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-auto py-4"
                        onClick={() => navigate("/results", { state: { myResultsOnly: true } })}
                      >
                        <ListPlus className="w-5 h-5 text-primary mr-3" />
                        <span>View My Tests</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-auto py-4"
                        onClick={() => navigate("/add")}
                      >
                        <PlusCircle className="w-5 h-5 text-primary mr-3" />
                        <span>Add New Test</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>

          </div>
        </div>
      </BackgroundPattern>
      <MobileFooter />
      
      {/* Profile Edit Dialog */}
      {profile && user && (
        <ProfileEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          currentUsername={profile.username}
          currentAvatarUrl={profile.avatar_url}
          userId={user.id}
          onSuccess={refetchProfile}
        />
      )}
    </div>
  );
};

export default Profile;
