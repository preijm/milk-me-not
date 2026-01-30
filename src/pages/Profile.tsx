import React, { useState } from "react";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPattern from "@/components/BackgroundPattern";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserMilkTests } from "@/hooks/useUserMilkTests";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobileOrTablet } from "@/hooks/use-mobile";
import { useProfileStats } from "@/hooks/useProfileStats";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";
import { ProfileContent } from "@/components/profile/ProfileContent";

const Profile = () => {
  const { user } = useAuth();
  const { profile, refetchProfile } = useUserProfile();
  const { data: milkTests = [] } = useUserMilkTests({
    column: "created_at",
    direction: "desc",
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobileOrTablet = useIsMobileOrTablet();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const { totalTests, avgRating, memberSince } = useProfileStats(milkTests, profile);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
      description: "See you soon!",
    });
    navigate("/");
  };


  const profileProps = {
    username: profile?.username || "User",
    email: user?.email || "",
    avatarUrl: profile?.avatar_url,
    totalTests,
    avgRating,
    memberSince,
    onEditClick: () => setEditDialogOpen(true),
    onSignOut: handleSignOut,
  };

  // Mobile/Tablet layout
  if (isMobileOrTablet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <MenuBar />
        <BackgroundPattern>
          <div className="min-h-screen pt-16 pb-24 lg:pb-12">
            <div className="container max-w-6xl mx-auto px-4 py-6 sm:py-8 relative z-10">
              <ProfileContent {...profileProps} variant="mobile" />
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
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <MenuBar />
      <BackgroundPattern>
        <div className="min-h-screen pt-16 pb-24 lg:pb-12">
          <div className="container max-w-6xl mx-auto px-4 py-6 sm:py-8 relative z-10">
            <ProfileContent {...profileProps} variant="desktop" />
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
