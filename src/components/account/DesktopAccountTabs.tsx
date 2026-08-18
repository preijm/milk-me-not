import React from "react";
import { User, Shield, Bell, Save, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoryButton } from "@/components/story/primitives";
import { Input } from "@/components/ui/input";
import { CountrySelect } from "@/components/milk-test/CountrySelect";
import NotificationSettings from "@/components/settings/NotificationSettings";

interface DesktopAccountTabsProps {
  username: string;
  setUsername: (value: string) => void;
  defaultCountry: string | null;
  setDefaultCountry: (value: string | null) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  loading: boolean;
  isChangingPassword: boolean;
  onUpdateProfile: (e: React.FormEvent) => void;
  onUpdatePassword: (e: React.FormEvent) => void;
}

export const DesktopAccountTabs = ({
  username,
  setUsername,
  defaultCountry,
  setDefaultCountry,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  isChangingPassword,
  onUpdateProfile,
  onUpdatePassword,
}: DesktopAccountTabsProps) => {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        <TabsList className="flex h-fit w-full flex-row gap-1 bg-story-cream p-1 md:w-48 md:flex-col">
          <TabsTrigger
            value="profile"
            className="flex-1 md:w-full justify-center md:justify-start gap-2 mb-0 md:mb-1"
          >
            <User className="w-6 h-6 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex-1 md:w-full justify-center md:justify-start gap-2 mb-0 md:mb-1"
          >
            <Shield className="w-6 h-6 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex-1 md:w-full justify-center md:justify-start gap-2"
          >
            <Bell className="w-6 h-6 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        <div className="min-w-0 flex-1">
          <TabsContent value="profile" className="mt-0 space-y-6">
            <form onSubmit={onUpdateProfile} className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[0.8125rem] font-bold text-story-ink-2">
                  Username
                </label>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="^[a-zA-Z0-9_-]+$"
                  title="Username can only contain letters, numbers, underscores, and hyphens"
                  className="story-hairline rounded-xl border-0 bg-story-cream text-story-ink placeholder:text-story-muted-2 focus-visible:ring-story-green"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[0.8125rem] font-bold text-story-ink-2">
                  Default Country (optional)
                </label>
                <CountrySelect
                  country={defaultCountry}
                  setCountry={setDefaultCountry}
                />
                <p className="mt-1.5 text-[0.75rem] text-story-muted-2">
                  This will be pre-selected when adding new milk tests
                </p>
              </div>
              </div>

              <StoryButton type="submit" className="w-full" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save Profile"}
              </StoryButton>
            </form>
          </TabsContent>

          <TabsContent value="security" className="mt-0 space-y-6">
            <form onSubmit={onUpdatePassword} className="space-y-6">
              <div>
                <label className="mb-1.5 block text-[0.8125rem] font-bold text-story-ink-2">
                  New Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  showPasswordToggle
                  className="story-hairline rounded-xl border-0 bg-story-cream text-story-ink placeholder:text-story-muted-2 focus-visible:ring-story-green"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[0.8125rem] font-bold text-story-ink-2">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  showPasswordToggle
                  className="story-hairline rounded-xl border-0 bg-story-cream text-story-ink placeholder:text-story-muted-2 focus-visible:ring-story-green"
                />
              </div>

              <StoryButton
                type="submit"
                className="w-full"
                disabled={
                  isChangingPassword || !newPassword || !confirmPassword
                }
              >
                <Lock className="w-4 h-4 mr-2" />
                {isChangingPassword ? "Updating..." : "Update Password"}
              </StoryButton>
            </form>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0 space-y-6">
            <NotificationSettings />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
};
