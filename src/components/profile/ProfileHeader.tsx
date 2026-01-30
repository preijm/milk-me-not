import React from "react";
import { User, Edit2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  username: string;
  email: string;
  avatarUrl?: string | null;
  memberSince?: string;
  onEditClick: () => void;
  onSignOut?: () => void;
  variant: "mobile" | "desktop";
}

export const ProfileHeader = ({
  username,
  email,
  avatarUrl,
  memberSince,
  onEditClick,
  onSignOut,
  variant,
}: ProfileHeaderProps) => {
  if (variant === "mobile") {
    return (
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80">
              <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
            </AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            variant="secondary"
            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-lg"
            onClick={onEditClick}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {username}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80">
            <User className="w-12 h-12 text-primary-foreground" />
          </AvatarFallback>
        </Avatar>
        <Button
          size="icon"
          variant="secondary"
          className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full shadow-lg"
          onClick={onEditClick}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-foreground">{username}</h1>
        <p className="text-muted-foreground mt-1">{email}</p>
        {memberSince && (
          <p className="text-sm text-muted-foreground mt-2">
            Member since {memberSince}
          </p>
        )}
      </div>
      {onSignOut && (
        <Button
          variant="destructive"
          onClick={onSignOut}
          className="flex-shrink-0"
        >
          <User className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      )}
    </div>
  );
};
