import React, { useState } from "react";
import { StoryAppLayout } from "@/components/story/StoryAppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserMilkTests } from "@/hooks/useUserMilkTests";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfileStats } from "@/hooks/useProfileStats";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { PublicProfile } from "@/components/profile/PublicProfile";

const Profile = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const { profile, refetchProfile } = useUserProfile();
  const { data: milkTests = [] } = useUserMilkTests({
    column: "created_at",
    direction: "desc",
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const { totalTests, avgRating, bestScore, memberSince } = useProfileStats(milkTests, profile);

  // /profile/:userId is a public page — a link someone shares. It used to fall
  // through to the signed-in user's own profile, so it showed the wrong person
  // (or nothing at all to a stranger).
  const isSomeoneElse = !!userId && userId !== user?.id;

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
    bestScore,
    memberSince,
    onEditClick: () => setEditDialogOpen(true),
    onSignOut: handleSignOut,
  };

  if (isSomeoneElse) {
    return <PublicProfile userId={userId} />;
  }

  // One shell, one branch: the two layouts differed only in the `variant` the
  // content component received, but each carried its own copy of the page
  // chrome and edit dialog.
  return (
    <StoryAppLayout
      title="Your ratings"
      lede="Everything you have scored, and what it adds up to."
      width="wide"
    >
      <ProfileContent {...profileProps} />

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
    </StoryAppLayout>
  );
};

export default Profile;
