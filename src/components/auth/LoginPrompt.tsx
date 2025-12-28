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
          <div className="flex justify-center mb-4">
            <div className="text-4xl">🔓</div>
          </div>
          <DialogTitle className="text-center text-xl">Ready to see more?</DialogTitle>
          <DialogDescription className="text-center mt-4">
            Join our community to unlock all reviews, leave comments, and share your own taste tests!
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Button onClick={handleLogin} variant="brand" className="border-0" size="lg" style={{
            backgroundColor: '#2144ff',
            color: 'white'
          }}>
            <LogIn className="mr-2 h-4 w-4" />
            Log In
          </Button>
          <Button onClick={handleSignUp} variant="outline" size="lg">
            <UserPlus className="mr-2 h-4 w-4" />
            Sign Up
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
};