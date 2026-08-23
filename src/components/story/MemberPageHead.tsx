import { cn } from "@/lib/utils";

/**
 * What a page says for itself once the reader is already a member, on a phone.
 *
 * The feed and the rankings both open with an editorial hero: kicker, a
 * three-line headline, a lede selling the project, a call to action and a row
 * of proof figures. That is the right way to meet a stranger. For someone
 * signed in it measured 1.39 screens of preamble on the feed and 1.26 on the
 * rankings before a single verdict or product appeared — they came to read the
 * thing, and had to scroll past more than a phone screen of pitch to reach it.
 *
 * Same argument as the footer: on this side of the sign-in the selling is done.
 * The hero stays whole for signed-out visitors at every width, and for everyone
 * on a desktop where the room exists. This is what a member gets instead — the
 * page's name and the one number worth knowing.
 */
export const MemberPageHead = ({
  kicker,
  title,
  meta,
  className,
}: {
  kicker: string;
  title: string;
  /** One line of orientation — a count, a freshness note. */
  meta?: string;
  className?: string;
}) => (
  <div className={cn("mx-auto w-full max-w-304 px-5 pb-3 pt-5 sm:px-8", className)}>
    <p className="story-kicker text-story-muted-2">{kicker}</p>
    <h1 className="story-display mt-1 text-[1.6rem] leading-[1.1] text-story-ink">{title}</h1>
    {meta && <p className="mt-1.5 text-[0.8125rem] text-story-muted">{meta}</p>}
  </div>
);

export default MemberPageHead;
