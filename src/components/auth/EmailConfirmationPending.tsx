import { Button } from "@/components/ui/button";

interface EmailConfirmationPendingProps {
  email: string;
  onBackToLogin: () => void;
}

const EmailConfirmationPending = ({ email, onBackToLogin }: EmailConfirmationPendingProps) => {
  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-8 text-brand-primary">
        Thanks for signing up!
      </h1>
      <div className="space-y-6 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-blue-800 mb-2">
            Please check your email to confirm your account
          </h2>
          <p className="text-blue-700 mb-4">
            We've sent a confirmation link to <strong>{email}</strong>. 
            Please click the link in your email to activate your account before logging in.
          </p>
          <p className="text-sm text-blue-600">
            Don't see the email? Check your spam folder or wait a few minutes for it to arrive.
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={onBackToLogin}
        >
          Back to Login
        </Button>
      </div>
    </>
  );
};

export default EmailConfirmationPending;