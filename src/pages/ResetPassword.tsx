import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPattern from "@/components/BackgroundPattern";
import PasswordResetForm from "@/components/auth/PasswordResetForm";
import { useAuthFlow } from "@/hooks/useAuthFlow";
import { Button } from "@/components/ui/button";

const ResetPassword = () => {
  const { 
    isPasswordReset, 
    isResetting, 
    handlePasswordUpdate 
  } = useAuthFlow();

  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
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
                    <Button
                      asChild
                      variant="brand"
                    >
                      <a href="/auth">Go to Login</a>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </BackgroundPattern>
      <MobileFooter />
    </div>
  );
};

export default ResetPassword;
