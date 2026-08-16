import { ArrowRight, StoryButton } from "@/components/story";

interface AuthFormButtonsProps {
  isLogin: boolean;
  loading: boolean;
  onForgotPassword: () => void;
  onToggleMode: () => void;
}

/**
 * The submit says what happens next, not what the form is called. Someone
 * arrived here mid-intent from a "start rating" button; "Sign Up" loses the
 * thread, "Create account & rate" keeps it.
 */
const AuthFormButtons = ({ isLogin, loading, onForgotPassword, onToggleMode }: AuthFormButtonsProps) => (
  <div className="flex flex-col gap-4">
    {isLogin && (
      <button
        type="button"
        onClick={onForgotPassword}
        className="-mt-1 self-end text-[0.8125rem] font-bold text-story-green-dark transition-colors hover:underline"
      >
        Forgot your password?
      </button>
    )}

    <StoryButton type="submit" disabled={loading} className="w-full">
      {loading ? "One moment…" : isLogin ? "Log in and keep rating" : "Create account & rate"}
      {!loading && <ArrowRight />}
    </StoryButton>

    <p className="text-center text-[0.875rem] text-story-muted">
      {isLogin ? "First time here? " : "Already have an account? "}
      <button
        type="button"
        onClick={onToggleMode}
        className="font-bold text-story-green-dark transition-colors hover:underline"
      >
        {isLogin ? "Create an account" : "Log in instead"}
      </button>
    </p>
  </div>
);

export default AuthFormButtons;
