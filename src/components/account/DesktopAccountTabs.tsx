import React from "react";
import { User, Shield, Bell, Save, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
        <TabsList className="flex flex-row md:flex-col h-fit w-full md:w-48 p-1">
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

        <div className="flex-1 h-[280px]">
          <TabsContent value="profile" className="space-y-6 mt-0 h-full">
            <form onSubmit={onUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Country (optional)
                </label>
                <CountrySelect
                  country={defaultCountry}
                  setCountry={setDefaultCountry}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be pre-selected when adding new milk tests
                </p>
              </div>

              <Button
                type="submit"
                variant="brand"
                className="w-full"
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-0 h-full">
            <form onSubmit={onUpdatePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
                />
              </div>

              <Button
                type="submit"
                variant="brand"
                className="w-full"
                disabled={
                  isChangingPassword || !newPassword || !confirmPassword
                }
              >
                <Lock className="w-4 h-4 mr-2" />
                {isChangingPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-0 h-full">
            <NotificationSettings />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
};
