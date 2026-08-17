import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowRight, Kicker, StoryButton } from "@/components/story";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sanitizeInput, validateEmail, passwordResetRateLimit } from "@/lib/security";
import { checkServerRateLimit } from "@/lib/rateLimitCheck";
interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const ResetPasswordDialog = ({
  open,
  onOpenChange
}: ResetPasswordDialogProps) => {
  const [resetEmail, setResetEmail] = useState("");
  const [resetInProgress, setResetInProgress] = useState(false);
  const {
    toast
  } = useToast();
  const handleForgotPassword = async () => {
    const sanitizedEmail = sanitizeInput(resetEmail).toLowerCase();
    
    if (!sanitizedEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    if (!validateEmail(sanitizedEmail)) {
      toast({
        title: "Invalid email format",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    // Check rate limiting
    const rateLimitKey = `reset_${sanitizedEmail}`;
    if (!passwordResetRateLimit.canAttempt(rateLimitKey)) {
      const remainingTime = Math.ceil(passwordResetRateLimit.getRemainingTime(rateLimitKey) / 60000);
      toast({
        title: "Too many attempts",
        description: `Please wait ${remainingTime} minutes before trying again.`,
        variant: "destructive"
      });
      return;
    }
    
    passwordResetRateLimit.recordAttempt(rateLimitKey);
    
    setResetInProgress(true);

    // Server-side rate limit check
    const serverCheck = await checkServerRateLimit('password_reset', sanitizedEmail);
    if (!serverCheck.allowed) {
      const retryMinutes = Math.ceil(serverCheck.retry_after_seconds / 60);
      toast({
        title: "Too many attempts",
        description: `Please wait ${retryMinutes} minute${retryMinutes !== 1 ? 's' : ''} before trying again.`,
        variant: "destructive"
      });
      setResetInProgress(false);
      return;
    }
    console.log("Starting password reset for email:", sanitizedEmail);
    try {
      // Use dynamic URL for password reset emails
      const redirectUrl = `${window.location.origin}/auth/reset-password`;
      console.log("Redirect URL:", redirectUrl);
      const {
        data,
        error
      } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: redirectUrl
      });
      console.log("Reset password response:", {
        data,
        error
      });
      if (error) {
        console.error("Reset password error:", error);
        throw error;
      }
      console.log("Password reset email sent successfully");
      toast({
        title: "Reset instructions sent",
        description: "If an account exists with this email, you'll receive password reset instructions. Check your email and spam folder."
      });
      onOpenChange(false);
      setResetEmail("");
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      toast({
        title: "Reset password failed",
        description: "Please check your email address and try again.",
        variant: "destructive"
      });
    } finally {
      setResetInProgress(false);
    }
  };
  // The one dialog reachable from the public site, so it stays inside the
  // story language rather than dropping the visitor into default chrome.
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="story-surface gap-0 rounded-[1.5rem] border-story-ink/10 p-6 sm:max-w-md sm:p-8">
        <DialogHeader className="space-y-0 text-left">
          <Kicker>Password reset</Kicker>
          <DialogTitle className="story-display pt-3 text-[1.75rem] leading-tight text-story-ink">
            We'll email you a link.
          </DialogTitle>
        </DialogHeader>

        <p className="mt-3 text-[0.9375rem] leading-relaxed text-story-muted">
          Enter the address you signed up with. If we have an account for it, the link lands in a minute or two.
        </p>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={e => {
            e.preventDefault();
            handleForgotPassword();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.8125rem] font-bold text-story-ink-2">Email</span>
            <Input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              className="h-12 rounded-xl border-[1.5px] border-story-ink/12 bg-white px-4 font-sans text-[0.9375rem] text-story-ink placeholder:text-story-muted-2 focus-visible:ring-2 focus-visible:ring-story-green focus-visible:ring-offset-0"
            />
          </div>

          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <StoryButton
              type="button"
              tone="outline"
              size="md"
              onClick={() => onOpenChange(false)}
              disabled={resetInProgress}
            >
              Cancel
            </StoryButton>
            <StoryButton type="submit" size="md" disabled={resetInProgress}>
              {resetInProgress ? "Sending…" : "Send the link"}
              {!resetInProgress && <ArrowRight />}
            </StoryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
};
export default ResetPasswordDialog;