import MenuBar from "@/components/MenuBar";
import BackgroundPatternWithOverlay from "@/components/BackgroundPatternWithOverlay";
import ResetPasswordDialog from "@/components/auth/ResetPasswordDialog";
import { useState } from "react";

const ResetPassword = () => {
  const [showResetDialog, setShowResetDialog] = useState(true);

  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPatternWithOverlay>
        <div className="flex items-center justify-center min-h-screen">
          <div className="container max-w-md mx-auto px-4 relative z-10">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 animate-fade-up">
              <h1 className="text-3xl font-bold text-center mb-8 text-[#00BF63]">
                Reset Password
              </h1>
              <p className="text-center text-gray-600 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <div className="text-center">
                <button
                  onClick={() => setShowResetDialog(true)}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[#00BF63] text-white shadow hover:bg-[#00BF63]/90 h-9 px-4 py-2"
                >
                  Send Reset Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </BackgroundPatternWithOverlay>
      <ResetPasswordDialog open={showResetDialog} onOpenChange={setShowResetDialog} />
    </div>
  );
};

export default ResetPassword;