
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ResetPasswordDialog = ({ open, onOpenChange }: ResetPasswordDialogProps) => {
  const [resetEmail, setResetEmail] = useState("");
  const [resetInProgress, setResetInProgress] = useState(false);
  const { toast } = useToast();

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }
    setResetInProgress(true);
    try {
      // Get the current origin but ensure it's not localhost
      const origin = window.location.origin;
      const redirectUrl = origin.includes('localhost') 
        ? 'https://jtabjndnietpewvknjrm.supabase.co/auth/v1/verify' 
        : `${origin}/auth/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      toast({
        title: "Reset instructions sent",
        description: "If an account exists with this email, you'll receive password reset instructions.",
      });
      onOpenChange(false);
      setResetEmail("");
    } catch (error: any) {
      // Generic error message to avoid revealing account existence
      toast({
        title: "Unable to process request",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setResetInProgress(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you instructions to reset your password.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={resetInProgress}
            >
              Cancel
            </Button>
            <Button
              onClick={handleForgotPassword}
              disabled={resetInProgress}
              style={{
                backgroundColor: '#2144FF',
                color: 'white'
              }}
            >
              <Lock className="w-4 h-4 mr-2" />
              {resetInProgress ? "Sending..." : "Send Instructions"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
