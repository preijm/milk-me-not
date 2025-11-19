import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUsername: string;
  currentAvatarUrl?: string | null;
  userId: string;
  onSuccess: () => void;
}

export const ProfileEditDialog = ({
  open,
  onOpenChange,
  currentUsername,
  currentAvatarUrl,
  userId,
  onSuccess,
}: ProfileEditDialogProps) => {
  const [username, setUsername] = useState(currentUsername);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Avatar image must be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let avatarUrl = currentAvatarUrl;

      // Upload avatar if a new file was selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${userId}/avatar.${fileExt}`;

        // Delete old avatar if exists
        if (currentAvatarUrl) {
          const oldPath = currentAvatarUrl.split('/').pop();
          if (oldPath) {
            await supabase.storage.from('avatars').remove([`${userId}/${oldPath}`]);
          }
        }

        // Upload new avatar
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          username,
          avatar_url: avatarUrl,
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={previewUrl || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80">
                <User className="h-12 w-12 text-primary-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-2">
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted/50 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload Photo</span>
                </div>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </Label>
              <p className="text-xs text-muted-foreground">Max 2MB • JPG, PNG, or WEBP</p>
            </div>
          </div>

          {/* Username Input */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              maxLength={50}
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
