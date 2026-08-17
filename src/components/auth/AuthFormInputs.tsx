import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AuthFormInputsProps {
  isLogin: boolean;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  emailError?: string;
  passwordError?: string;
  usernameError?: string;
}

const fieldClass = (hasError?: string) =>
  cn(
    "h-12 rounded-xl border-[1.5px] bg-white px-4 font-sans text-[0.9375rem] text-story-ink",
    "placeholder:text-story-muted-2 focus-visible:ring-2 focus-visible:ring-story-green focus-visible:ring-offset-0",
    hasError ? "border-error" : "border-story-ink/12",
  );

const Field = ({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[0.8125rem] font-bold text-story-ink-2">{label}</span>
      {hint && <span className="text-[0.75rem] font-medium text-story-muted-2">{hint}</span>}
    </div>
    {children}
    {error && (
      <p className="text-[0.8125rem] font-medium text-error" role="alert">
        {error}
      </p>
    )}
  </div>
);

const AuthFormInputs = ({
  isLogin,
  email,
  setEmail,
  password,
  setPassword,
  username,
  setUsername,
  emailError,
  passwordError,
  usernameError,
}: AuthFormInputsProps) => (
  <div className="flex flex-col gap-4">
    {!isLogin && (
      <Field label="Username" hint="Shown on your ratings" error={usernameError}>
        <Input
          type="text"
          autoComplete="username"
          placeholder="oatsupremacist"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required={!isLogin}
          minLength={3}
          maxLength={30}
          pattern="^[a-zA-Z0-9_-]+$"
          title="Letters, numbers, underscores and hyphens only"
          className={fieldClass(usernameError)}
        />
      </Field>
    )}

    <Field label="Email" error={emailError}>
      <Input
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={fieldClass(emailError)}
      />
    </Field>

    <Field label="Password" hint={isLogin ? undefined : "At least 6 characters"} error={passwordError}>
      <Input
        type="password"
        autoComplete={isLogin ? "current-password" : "new-password"}
        placeholder={isLogin ? "Your password" : "Something memorable"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        showPasswordToggle
        className={fieldClass(passwordError)}
      />
    </Field>
  </div>
);

export default AuthFormInputs;
