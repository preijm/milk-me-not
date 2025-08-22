import React from "react";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";
interface AuthFormButtonsProps {
  isLogin: boolean;
  loading: boolean;
  onForgotPassword: () => void;
  onToggleMode: () => void;
}
const AuthFormButtons = ({
  isLogin,
  loading,
  onForgotPassword,
  onToggleMode
}: AuthFormButtonsProps) => {
  return <>
      {isLogin && <button type="button" onClick={onForgotPassword} className="text-sm text-[#9F9EA1] hover:text-[#8E9196] transition-colors text-right w-full">
          Forgot password?
        </button>}

      <Button type="submit" variant="brand" className="w-full h-12 text-base font-medium rounded-lg" disabled={loading}>
        {loading ? "Loading..." : isLogin ? <div className="flex items-center justify-center gap-2">
            <LogIn className="w-5 h-5" />
            <span>Log In</span>
          </div> : <div className="flex items-center justify-center gap-2">
            <UserPlus className="w-5 h-5" />
            <span>Sign Up</span>
          </div>}
      </Button>

      <div className="text-center mt-6">
        <button type="button" onClick={onToggleMode} className="text-[#00BF63] hover:text-emerald-700 transition-colors font-medium">
          {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </>;
};
export default AuthFormButtons;