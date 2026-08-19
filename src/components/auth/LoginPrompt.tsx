import { useNavigate } from "react-router-dom";
import { ArrowRight, StoryButton, StoryDialog, StoryDialogActions } from "@/components/story";

interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

/**
 * What a signed-out visitor gets when they click through to a product.
 *
 * The product they reached for is named in the title. The old version threw
 * that away and asked "Ready to see more?" over a padlock emoji, which is the
 * same wall every site puts up and says nothing about what is behind it.
 *
 * Signing up returns them to the page they were on rather than the homepage —
 * being bounced to the front door after a sign-up is how people leave.
 */
export const LoginPrompt = ({ isOpen, onClose, productName }: LoginPromptProps) => {
  const navigate = useNavigate();
  const from = window.location.pathname + window.location.search;

  const goToAuth = (mode?: "signup") => {
    onClose();
    navigate("/auth", { state: { from, ...(mode ? { mode } : {}) } });
  };

  return (
    <StoryDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      kicker="One step away"
      title={
        productName ? (
          <>
            Who rated <span className="text-story-green-dark">{productName}</span>, and what they said.
          </>
        ) : (
          <>
            Every rating, and <span className="text-story-green-dark">who wrote it.</span>
          </>
        )
      }
      lede="Scores are open to everyone. The tasting notes behind them — the person, the shop, the verdict in their own words — are for the people who write them."
      size="lg"
    >
      <StoryDialogActions>
        <StoryButton tone="outline" size="md" onClick={() => goToAuth()}>
          I already have an account
        </StoryButton>
        <StoryButton size="md" onClick={() => goToAuth("signup")}>
          Join — it's free
          <ArrowRight />
        </StoryButton>
      </StoryDialogActions>
    </StoryDialog>
  );
};
