import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sanitizeInput, validateEmail, passwordResetRateLimit } from "@/lib/security";
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
    } catch (error: any) {
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
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input type="email" placeholder="Enter your email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm" />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={resetInProgress}>
              Cancel
            </Button>
            <Button onClick={handleForgotPassword} disabled={resetInProgress} variant="brand">
              <Lock className="w-4 h-4 mr-2" />
              {resetInProgress ? "Sending..." : "Send Instructions"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
export default ResetPasswordDialog;