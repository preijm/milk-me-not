import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User, Shield, Bell, Globe, HelpCircle } from "lucide-react";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPattern from "@/components/BackgroundPattern";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileSettingsMenu, MenuSection } from "@/components/account/MobileSettingsMenu";
import { DesktopAccountTabs } from "@/components/account/DesktopAccountTabs";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";
import { useUserProfile } from "@/hooks/useUserProfile";

const Account = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [defaultCountry, setDefaultCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const isMobile = useIsMobile();
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

  // Build menu sections with Profile onClick handler
  const accountMenuSections: MenuSection[] = useMemo(() => [
    {
      title: "Account",
      items: [
        {
          icon: User,
          iconBgColor: "#dbeafe",
          iconColor: "#2563eb",
          title: "Profile",
          description: "Edit your personal information",
          onClick: () => setEditDialogOpen(true),
        },
        {
          icon: Shield,
          iconBgColor: "#f3e8ff",
          iconColor: "#9333ea",
          title: "Security",
          description: "Password and authentication",
          path: "/account/security",
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: Bell,
          iconBgColor: "#ffedd5",
          iconColor: "#ea580c",
          title: "Notifications",
          description: "Manage your alerts",
          path: "/account/notifications",
        },
        {
          icon: Globe,
          iconBgColor: "#dcfce7",
          iconColor: "#16a34a",
          title: "Country",
          description: "Set your default location",
          path: "/account/country",
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          iconBgColor: "#fef9c3",
          iconColor: "#ca8a04",
          title: "Contact",
          description: "Reach out to our team",
          path: "/contact",
        },
        {
          icon: HelpCircle,
          iconBgColor: "#e0e7ff",
          iconColor: "#4f46e5",
          title: "FAQ",
          description: "Frequently asked questions",
          path: "/faq",
        },
        {
          icon: HelpCircle,
          iconBgColor: "#dcfce7",
          iconColor: "#16a34a",
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

  // Mobile view
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <MenuBar />

        <div className="px-4 py-6 pb-24 pt-20">
          <MobileSettingsMenu sections={accountMenuSections} />

          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full mt-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            <LogOut className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform duration-300" />
            Log Out
          </Button>
        </div>

        {/* Profile Edit Dialog */}
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

        <MobileFooter />
      </div>
    );
  }

  // Desktop view
  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="flex items-center justify-center min-h-screen py-8 pt-20 pb-24 md:pb-8">
          <div className="container max-w-4xl mx-auto px-4 relative z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20 animate-fade-up">
              {/* Header Section */}
              <div className="bg-muted px-8 py-6">
                <h1 className="text-3xl font-bold mb-2 text-[hsl(var(--brand-primary))]">
                  Account Settings
                </h1>
                <p className="text-gray-600">
                  Manage your account preferences and security
                </p>
              </div>

              <div className="p-8">
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
              </div>
            </div>
          </div>
        </div>
      </BackgroundPattern>
      <MobileFooter />
    </div>
  );
};

export default Account;
