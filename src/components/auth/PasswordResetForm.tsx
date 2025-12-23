import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PasswordResetFormProps {
  isResetting: boolean;
  onPasswordUpdate: (newPassword: string, confirmPassword: string) => void;
}

const PasswordResetForm = ({ isResetting, onPasswordUpdate }: PasswordResetFormProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = () => {
    onPasswordUpdate(newPassword, confirmPassword);
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-8 text-brand-primary">
        Reset Your Password
      </h1>
      <div className="space-y-6">
        {isResetting ? (
          <div className="text-center">
            <p className="text-gray-600">Setting up your password reset...</p>
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600 mb-6">
              Enter your new password below.
            </p>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={8}
                showPasswordToggle
                className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                showPasswordToggle
                className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
              />
              <Button
                variant="brand"
                className="w-full"
                disabled={isResetting}
                onClick={handleSubmit}
              >
                {isResetting ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PasswordResetForm;