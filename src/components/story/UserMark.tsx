import { cn } from "@/lib/utils";
import { markFor } from "./userMarkTone";

/**
 * The mark that stands in for a person.
 *
 * Every initial avatar in the app was `bg-story-ink` — a black disc with a
 * white letter — so a notifications page or a feed run by two or three regulars
 * showed a column of identical black circles, and the letter was the only thing
 * telling them apart. BrandMark already makes the argument for the other half
 * of this: colouring a mark from its content "keeps a long list varied instead
 * of stamping one icon down the page". People deserve the same.
 *
 * The colour comes from the name, so it is stable and needs no column in the
 * database and no choice from the reader.
 */

type UserMarkProps = {
  name: string | null | undefined;
  /** Two letters suit a profile header; one suits a dense row. */
  letters?: 1 | 2;
  /** Tailwind size and type classes, e.g. "h-10 w-10 text-sm". */
  className?: string;
  radius?: string;
};

export const UserMark = ({ name, letters = 1, className, radius = "rounded-full" }: UserMarkProps) => {
  const trimmed = (name ?? "").trim();
  const tone = markFor(trimmed);

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center font-extrabold",
        radius,
        tone.bg,
        tone.fg,
        className,
      )}
    >
      {/* "U" for an unknown user, which is what every call site did before this
          component existed and what FeedHeader's test asserts. */}
      {trimmed ? trimmed.slice(0, letters).toUpperCase() : "U"}
    </span>
  );
};

export default UserMark;
