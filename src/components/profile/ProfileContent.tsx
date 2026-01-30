import React from "react";
import { LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats";
import { ProfileActions } from "./ProfileActions";

interface ProfileContentProps {
  username: string;
  email: string;
  avatarUrl?: string | null;
  totalTests: number;
  avgRating: string;
  memberSince: string;
  onEditClick: () => void;
  onSignOut: () => void;
  variant: "mobile" | "desktop";
}

export const ProfileContent = ({
  username,
  email,
  avatarUrl,
  totalTests,
  avgRating,
  memberSince,
  onEditClick,
  onSignOut,
  variant,
}: ProfileContentProps) => {
  if (variant === "mobile") {
    return (
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <ProfileHeader
              username={username}
              email={email}
              avatarUrl={avatarUrl}
              onEditClick={onEditClick}
              variant="mobile"
            />
          </CardContent>
        </Card>

        {/* User Stats */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">
              Your Activity
            </h2>
            <ProfileStats
              totalTests={totalTests}
              avgRating={avgRating}
              memberSince={memberSince}
              variant="mobile"
            />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">
              Quick Actions
            </h2>
            <ProfileActions variant="mobile" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header - Desktop horizontal layout */}
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <ProfileHeader
              username={username}
              email={email}
              avatarUrl={avatarUrl}
              memberSince={memberSince}
              onEditClick={onEditClick}
              variant="desktop"
            />
            <Button
              variant="destructive"
              onClick={onSignOut}
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
            <h2 className="text-xl font-semibold mb-6 text-foreground">
              Your Activity
            </h2>
            <ProfileStats
              totalTests={totalTests}
              avgRating={avgRating}
              memberSince={memberSince}
              variant="desktop"
            />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-foreground">
              Quick Actions
            </h2>
            <ProfileActions variant="desktop" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
