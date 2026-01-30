import React from "react";
import { TrendingUp, User } from "lucide-react";

interface ProfileStatsProps {
  totalTests: number;
  avgRating: string;
  memberSince: string;
  variant: "mobile" | "desktop";
}

export const ProfileStats = ({
  totalTests,
  avgRating,
  memberSince,
  variant,
}: ProfileStatsProps) => {
  if (variant === "mobile") {
    return (
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
    );
  }

  return (
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
  );
};
