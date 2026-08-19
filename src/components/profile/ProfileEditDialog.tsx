import { useState } from "react";
import {
  ArrowRight,
  StoryButton,
  StoryDialog,
  StoryDialogActions,
  StoryField,
  StoryInput,
} from "@/components/story";
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
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Error updating profile",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // The dialog the redesign missed: it was still shipping shadcn defaults, so
  // Save Changes arrived in the old system's electric blue directly under an
  // avatar in the new system's green.
  return (
    <StoryDialog
      open={open}
      onOpenChange={onOpenChange}
      kicker="Your profile"
      title="How you show up on a rating."
      lede="Your name and picture sit beside every score you file. Nothing else about you is shown."
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex items-center gap-5">
          <Avatar className="h-20 w-20 flex-shrink-0">
            <AvatarImage src={previewUrl || undefined} />
            <AvatarFallback className="bg-story-green-wash">
              <User className="h-9 w-9 text-story-green-dark" />
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-start gap-2">
            <label
              htmlFor="avatar"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-story-ink/15 px-5 py-2.5 font-sans text-sm font-bold tracking-[-0.01em] text-story-ink transition-colors hover:bg-story-ink/[0.05] focus-within:ring-2 focus-within:ring-story-green focus-within:ring-offset-2"
            >
              <Upload className="h-4 w-4" />
              {previewUrl ? "Change picture" : "Add a picture"}
              <input id="avatar" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
            </label>
            <p className="text-[0.8125rem] text-story-muted-2">JPG, PNG or WEBP, up to 2MB.</p>
          </div>
        </div>

        <StoryField label="Username" htmlFor="username" hint="This is the name shown on your ratings.">
          <StoryInput
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="What should we call you?"
            maxLength={50}
            required
          />
        </StoryField>

        <StoryDialogActions>
          <StoryButton type="button" tone="outline" size="md" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </StoryButton>
          <StoryButton type="submit" size="md" disabled={isLoading}>
            {isLoading ? "Saving…" : "Save changes"}
            {!isLoading && <ArrowRight />}
          </StoryButton>
        </StoryDialogActions>
      </form>
    </StoryDialog>
  );
};
