import { useState } from "react";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPattern from "@/components/BackgroundPattern";
import AuthForm from "@/components/auth/AuthForm";
import ResetPasswordDialog from "@/components/auth/ResetPasswordDialog";
import EmailConfirmationPending from "@/components/auth/EmailConfirmationPending";
import PasswordResetForm from "@/components/auth/PasswordResetForm";
import AuthFooter from "@/components/auth/AuthFooter";
import { useAuthFlow } from "@/hooks/useAuthFlow";

const Auth = () => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [emailPending, setEmailPending] = useState<string | null>(null);
  
  const { 
    isPasswordReset, 
    isEmailConfirmed, 
    isEmailPending,
    userEmail,
    isResetting, 
    setIsEmailConfirmed,
    setIsEmailPending,
    handlePasswordUpdate 
  } = useAuthFlow();

  const shouldShowEmailPending = emailPending || isEmailPending;
  const pendingEmail = emailPending || userEmail;

  return (
    <div className="min-h-screen relative">
      <MenuBar />
      <BackgroundPattern>
        <div className="flex flex-col items-center justify-center min-h-screen">
          {/* Mobile Logo - only visible on small screens */}
          <div className="md:hidden flex flex-col items-center mb-8 mt-16">
            <div className="text-6xl mb-2">🥛</div>
            <h1 className="text-3xl font-bold text-brand-primary">Milk Me Not</h1>
            <p className="text-muted-foreground text-sm mt-1">Find your perfect plant milk</p>
          </div>
          
          <div className="container max-w-md mx-auto px-4 relative z-10">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 animate-fade-up">
              {shouldShowEmailPending ? (
                <EmailConfirmationPending 
                  email={pendingEmail}
                  onBackToLogin={() => {
                    setEmailPending(null);
                    setIsEmailPending(false);
                  }} 
                />
              ) : isPasswordReset ? (
                <PasswordResetForm 
                  isResetting={isResetting}
                  onPasswordUpdate={handlePasswordUpdate}
                />
              ) : (
                <AuthForm 
                  onForgotPassword={() => setShowResetDialog(true)} 
                  isEmailConfirmed={isEmailConfirmed}
                  onEmailConfirmedDismiss={() => setIsEmailConfirmed(false)}
                  onEmailPending={setEmailPending}
                />
              )}
            </div>
          </div>
        </div>
        <AuthFooter />
      </BackgroundPattern>
      <MobileFooter />
      <ResetPasswordDialog open={showResetDialog} onOpenChange={setShowResetDialog} />
    </div>
  );
};

export default Auth;
