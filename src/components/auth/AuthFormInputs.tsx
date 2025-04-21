
import React from "react";
import { Input } from "@/components/ui/input";

interface AuthFormInputsProps {
  isLogin: boolean;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
}

const AuthFormInputs = ({
  isLogin,
  email,
  setEmail,
  password,
  setPassword,
  username,
  setUsername
}: AuthFormInputsProps) => {
  return (
    <>
      {!isLogin && (
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required={!isLogin}
          minLength={3}
          maxLength={30}
          pattern="^[a-zA-Z0-9_-]+$"
          title="Username can only contain letters, numbers, underscores, and hyphens"
          className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
        />
      )}

      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
      />

      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        minLength={6}
        showPasswordToggle
        className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
      />
    </>
  );
};

export default AuthFormInputs;
