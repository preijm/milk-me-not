import { useEffect } from "react";

interface UseHighlightScrollOptions {
  /** The ID of the element to scroll to (without prefix) */
  targetId: string | null;
  /** Prefix to add to the element ID (e.g., "test-" for "test-123") */
  idPrefix?: string;
  /** Whether the scroll should be triggered (e.g., when data is loaded) */
  enabled?: boolean;
  /** Duration in ms for the highlight effect */
  highlightDuration?: number;
  /** Delay in ms before scrolling */
  scrollDelay?: number;
  /** CSS classes to add for the highlight effect */
  highlightClasses?: string[];
}

export function useHighlightScroll({
  targetId,
  idPrefix = "",
  enabled = true,
  highlightDuration = 3000,
  scrollDelay = 100,
  highlightClasses = [
    "ring-2",
    "ring-[hsl(var(--brand-blue))]",
    "ring-offset-2",
  ],
}: UseHighlightScrollOptions) {
  useEffect(() => {
    if (!targetId || !enabled) return;

    const timer = setTimeout(() => {
      const elementId = `${idPrefix}${targetId}`;
      const element = document.getElementById(elementId);
      
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        
        // Add highlight effect
        element.classList.add(...highlightClasses);
        
        // Remove highlight after duration
        setTimeout(() => {
          element.classList.remove(...highlightClasses);
        }, highlightDuration);
      }
    }, scrollDelay);

    return () => clearTimeout(timer);
  }, [targetId, enabled, idPrefix, highlightDuration, scrollDelay, highlightClasses]);
}
