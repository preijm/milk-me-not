import React from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";
interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}
export const LoginPrompt = ({
  isOpen,
  onClose,
  productName
}: LoginPromptProps) => {
  const navigate = useNavigate();
  const handleLogin = () => {
    onClose();
    navigate('/auth', {
      state: {
        from: window.location.pathname
      }
    });
  };
  const handleSignUp = () => {
    onClose();
    navigate('/auth', {
      state: {
        from: window.location.pathname,
        mode: 'signup'
      }
    });
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Login Required</DialogTitle>
          <DialogDescription className="text-center">
            {productName ? `To view individual test results for ${productName}, please log in or create an account.` : "To view individual test results, please log in or create an account."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-6">
          <Button onClick={handleLogin} className="w-full" size="lg">
            <LogIn className="mr-2 h-4 w-4" />
            Log In
          </Button>
          
          <Button onClick={handleSignUp} variant="outline" className="w-full" size="lg">
            <UserPlus className="mr-2 h-4 w-4" />
            Create Account
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-4">Join the community, read reviews, and show off your own taste tests!</p>
      </DialogContent>
    </Dialog>;
};