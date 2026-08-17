import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * The site's one call to action.
 *
 * Every public page, at every breakpoint, offers exactly this: a route into the
 * fast rating flow. Signed-in visitors go straight to it; everyone else lands
 * on sign-up with the rating flow held as their destination.
 */
export const useRateCta = (options?: { label?: string; shortLabel?: string }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthed = !!user;

  const go = useCallback(() => {
    if (isAuthed) {
      navigate("/add");
    } else {
      navigate("/auth", { state: { from: "/add" } });
    }
  }, [isAuthed, navigate]);

  return {
    go,
    isAuthed,
    /** Full-width label for hero and section CTAs. */
    label: options?.label ?? (isAuthed ? "Rate a milk" : "Start rating — it's free"),
    /** Compact label for the header and the sticky mobile bar. */
    shortLabel: options?.shortLabel ?? (isAuthed ? "Rate a milk" : "Start rating"),
    /** Where the CTA lands, for links that need an href. */
    to: isAuthed ? "/add" : "/auth",
  };
};
