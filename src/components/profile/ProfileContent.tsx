import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, TrendingUp, Star, Calendar, ListPlus, PlusCircle, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats";
import { ProfileActions } from "./ProfileActions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface ProfileContentProps {
  username: string;
  email: string;
  avatarUrl?: string | null;
  totalTests: number;
  avgRating: string;
  bestScore: number;
  memberSince: string;
  onEditClick: () => void;
  onSignOut: () => void;
  variant: "mobile" | "desktop";
}

interface MobileMenuItem {
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
  title: string;
  value?: string;
  action?: () => void;
  path?: string;
}

const MobileProfileMenuItem = ({ 
  item, 
  showChevron = false 
}: { 
  item: MobileMenuItem;
  showChevron?: boolean;
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: item.iconBgColor }}
      >
        <item.icon
          className="w-6 h-6"
          style={{ color: item.iconColor }}
        />
      </div>
      <div className="flex-1 text-left">
        <h4 className="font-semibold text-foreground">{item.title}</h4>
        {item.value && (
          <p className="text-sm text-muted-foreground">{item.value}</p>
        )}
      </div>
      {showChevron && (
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      )}
    </button>
  );
};

export const ProfileContent = ({
  username,
  email,
  avatarUrl,
  totalTests,
  avgRating,
  bestScore,
  memberSince,
  onEditClick,
  onSignOut,
  variant,
}: ProfileContentProps) => {
  const navigate = useNavigate();

  if (variant === "mobile") {
    

    return (
      <div className="space-y-6">
        {/* Profile Header Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <button onClick={onEditClick} className="relative group flex-shrink-0">
                <Avatar className="h-16 w-16 ring-2 ring-background shadow-md">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80">
                    <User className="w-8 h-8 text-primary-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-[10px] font-medium">Edit</span>
                </div>
              </button>
              <div className="text-left min-w-0">
                <h1 className="text-xl font-bold text-foreground truncate">{username}</h1>
                <p className="text-sm text-muted-foreground truncate">{email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Stats Section - Compact Grid */}
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase mb-4 px-1 tracking-wide">
            Your Activity
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Tests</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{totalTests}</p>
            </div>
            <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">Avg Rating</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{avgRating}</p>
            </div>
            <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">Best Score</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{bestScore > 0 ? bestScore : "—"}</p>
            </div>
            <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Joined</span>
              </div>
              <p className="text-sm font-semibold text-foreground mt-1">{memberSince}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase mb-4 px-1 tracking-wide">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/results", { state: { myResultsOnly: true } })}
              className="bg-card rounded-2xl p-4 shadow-sm border border-border text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <ListPlus className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Browse</span>
              </div>
              <p className="text-sm font-medium text-foreground">My Results</p>
            </button>
            <button
              onClick={() => navigate("/add")}
              className="bg-card rounded-2xl p-4 shadow-sm border border-border text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <PlusCircle className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">New</span>
              </div>
              <p className="text-sm font-medium text-foreground">Add Test</p>
            </button>
          </div>
        </div>
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
