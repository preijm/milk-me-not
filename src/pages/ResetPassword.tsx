import MenuBar from "@/components/MenuBar";
import BackgroundPatternWithOverlay from "@/components/BackgroundPatternWithOverlay";
import PasswordResetForm from "@/components/auth/PasswordResetForm";
import { useAuthFlow } from "@/hooks/useAuthFlow";

const ResetPassword = () => {
  const { 
    isPasswordReset, 
    isResetting, 
    handlePasswordUpdate 
  } = useAuthFlow();

  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPatternWithOverlay>
        <div className="flex items-center justify-center min-h-screen">
          <div className="container max-w-md mx-auto px-4 relative z-10">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 animate-fade-up">
              {isPasswordReset ? (
                <PasswordResetForm 
                  isResetting={isResetting}
                  onPasswordUpdate={handlePasswordUpdate}
                />
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-center mb-8 text-[#00BF63]">
                    Invalid Reset Link
                  </h1>
                  <p className="text-center text-gray-600 mb-6">
                    This password reset link is invalid or has expired. Please request a new one.
                  </p>
                  <div className="text-center">
                    <a
                      href="/auth"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                    >
                      Go to Login
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </BackgroundPatternWithOverlay>
    </div>
  );
};

export default ResetPassword;
