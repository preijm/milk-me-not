import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ArrowRight, Display, StoryButton } from "@/components/story";

interface PasswordResetFormProps {
  isResetting: boolean;
  onPasswordUpdate: (newPassword: string, confirmPassword: string) => void;
}

const fieldClass =
  "h-12 rounded-xl border-[1.5px] border-story-ink/12 bg-white px-4 font-sans text-[0.9375rem] text-story-ink " +
  "placeholder:text-story-muted-2 focus-visible:ring-2 focus-visible:ring-story-green focus-visible:ring-offset-0";

const PasswordResetForm = ({ isResetting, onPasswordUpdate }: PasswordResetFormProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div>
      <Display size="md">Pick a new password.</Display>

      {isResetting ? (
        <p className="mt-4 text-[0.9375rem] text-story-muted">Setting up your reset…</p>
      ) : (
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onPasswordUpdate(newPassword, confirmPassword);
          }}
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.8125rem] font-bold text-story-ink-2">New password</span>
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              showPasswordToggle
              className={fieldClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[0.8125rem] font-bold text-story-ink-2">Confirm it</span>
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="Same again"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              showPasswordToggle
              className={fieldClass}
            />
          </div>

          <StoryButton type="submit" className="mt-1 w-full">
            Update password
            <ArrowRight />
          </StoryButton>
        </form>
      )}
    </div>
  );
};

export default PasswordResetForm;
