import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User, Shield, Bell, Globe, HelpCircle } from "lucide-react";
import { StoryAppLayout } from "@/components/story/StoryAppLayout";
import { StoryButton } from "@/components/story/primitives";
import { MobileSettingsMenu, MenuSection } from "@/components/account/MobileSettingsMenu";
import { DesktopAccountTabs } from "@/components/account/DesktopAccountTabs";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";
import { SecurityDialog } from "@/components/settings/SecurityDialog";
import { NotificationDialog } from "@/components/settings/NotificationDialog";
import { CountryDialog } from "@/components/settings/CountryDialog";
import { useUserProfile } from "@/hooks/useUserProfile";

const Account = () => {
  const [username, setUsername] = useState("");
  const [_email, setEmail] = useState("");
  const [defaultCountry, setDefaultCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [countryDialogOpen, setCountryDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, refetchProfile } = useUserProfile();

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
      setEmail(user.email || "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, default_country_code")
        .eq("id", user.id)
        .maybeSingle();
      if (profile) {
        setUsername(profile.username);
        setDefaultCountry(profile.default_country_code);
      }
    };
    getProfile();
  }, [navigate]);

  // Build menu sections with onClick handlers for dialogs (mobile)
  const accountMenuSections: MenuSection[] = useMemo(() => [
    {
      title: "Account",
      items: [
        {
          icon: User,
          title: "Profile",
          description: "Edit your personal information",
          onClick: () => setEditDialogOpen(true),
        },
        {
          icon: Shield,
          title: "Security",
          description: "Password and authentication",
          onClick: () => setSecurityDialogOpen(true),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: Bell,
          title: "Notifications",
          description: "Manage your alerts",
          onClick: () => setNotificationDialogOpen(true),
        },
        {
          icon: Globe,
          title: "Country",
          description: "Set your default location",
          onClick: () => setCountryDialogOpen(true),
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          title: "Contact",
          description: "Reach out to our team",
          path: "/contact",
        },
        {
          icon: HelpCircle,
          title: "FAQ",
          description: "Frequently asked questions",
          path: "/faq",
        },
        {
          icon: HelpCircle,
          title: "About",
          description: "Learn about our story",
          path: "/about",
        },
      ],
    },
  ], []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    try {
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", userId)
        .maybeSingle();
      if (existingUser) {
        toast({
          title: "Username taken",
          description: "Please choose a different username.",
          variant: "destructive",
        });
        return;
      }
      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          default_country_code: defaultCountry,
        })
        .eq("id", userId);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      toast({
        title: "Success",
        description: "Password updated successfully.",
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  // One shell for both. The mobile arm listed its settings as a tapped menu of
  // dialogs and the desktop arm as tabs; both are kept, chosen by CSS rather
  // than by a breakpoint read in JS.
  return (
    <StoryAppLayout
      kicker="Your account"
      title="Details, password,"
      accent="and your inbox."
      lede="What we know about you, and what we are allowed to send you."
      width="wide"
    >
      <div className="lg:hidden">
        <MobileSettingsMenu sections={accountMenuSections} />
        <StoryButton tone="outline" onClick={handleLogout} className="mt-7 w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </StoryButton>
      </div>

      <div className="story-hairline hidden rounded-3xl bg-white p-7 lg:block">
        <DesktopAccountTabs
          username={username}
          setUsername={setUsername}
          defaultCountry={defaultCountry}
          setDefaultCountry={setDefaultCountry}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          loading={loading}
          isChangingPassword={isChangingPassword}
          onUpdateProfile={handleUpdateProfile}
          onUpdatePassword={handleUpdatePassword}
        />
        <StoryButton tone="outline" onClick={handleLogout} className="mt-7">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </StoryButton>
      </div>

      {profile && userId && (
        <ProfileEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          currentUsername={profile.username}
          currentAvatarUrl={profile.avatar_url}
          userId={userId}
          onSuccess={refetchProfile}
        />
      )}
      <SecurityDialog open={securityDialogOpen} onOpenChange={setSecurityDialogOpen} />
      <NotificationDialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen} />
      <CountryDialog open={countryDialogOpen} onOpenChange={setCountryDialogOpen} />
    </StoryAppLayout>
  );
};

export default Account;
