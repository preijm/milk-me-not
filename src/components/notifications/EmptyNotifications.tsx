import { MilkDrop } from "@/components/story/motifs";
import { StoryLinkButton, ArrowRight } from "@/components/story/primitives";
import { cn } from "@/lib/utils";

/**
 * What an empty inbox looks like.
 *
 * On the full page this used to be a small grey card pinned to the top of an
 * otherwise blank canvas — a critic ranked it the weakest screen in the set,
 * with more than half the scroll height bare. An empty state is still a screen
 * someone is looking at, so it says something, and offers the one action that
 * would eventually fill it.
 */
export const EmptyNotifications = ({ onPage = false }: { onPage?: boolean }) => (
  <div
    className={cn(
      "flex flex-col items-center text-center",
      onPage ? "px-6 py-14 sm:py-20" : "px-6 py-10",
    )}
  >
    <MilkDrop size={onPage ? 92 : 64} variant="solid" className="text-story-green-light" />
    <p
      className={cn(
        "story-display mt-5 text-story-ink",
        onPage ? "text-[1.6rem] sm:text-[2rem]" : "text-[1.2rem]",
      )}
    >
      Nothing yet.
    </p>
    <p className="mt-2 max-w-104 text-[0.9375rem] text-story-muted">
      When someone likes a rating you left, or replies to it, it turns up here.
    </p>
    {onPage && (
      <StoryLinkButton to="/add" className="mt-6">
        Rate a milk
        <ArrowRight />
      </StoryLinkButton>
    )}
  </div>
);

export default EmptyNotifications;
