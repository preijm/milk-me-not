/**
 * The story dialog shell.
 *
 * Every overlay on the site is the same object: a cream card with a hairline,
 * a kicker, display type and story buttons. Before this existed each dialog
 * reached for shadcn's defaults and arrived in whatever palette it happened to
 * import — an electric-blue Save inside a green site, a padlock emoji where a
 * sentence should be. A visitor who opens a dialog has not left the page, so
 * the dialog must not look like it belongs to a different one.
 *
 * `story-surface` is repeated on the content because dialogs portal out of the
 * page into `body`, beyond the reach of any surface class the layout sets.
 */

import { forwardRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Kicker } from "./primitives";

/**
 * The card itself. Exported because the destructive confirmations keep Radix's
 * AlertDialog — it traps focus differently and refuses a stray outside click,
 * which is the point of an "are you sure" — so they cannot reuse StoryDialog's
 * shell but must still look identical to it.
 */
export const STORY_DIALOG_SURFACE =
  // `!bg-story-cream` beats shadcn's own `bg-background` on the content. Utilities
  // outrank the base layer `story-surface` paints in, so without this the card
  // takes the app's background token — and follows it to near-black in dark mode,
  // which is the one thing story-surface exists to prevent.
  "story-surface !bg-story-cream story-lift gap-0 rounded-[1.5rem] border-story-ink/10 p-6 sm:p-8 " +
  // Tall dialogs (the registration form, the camera) must not run off a short
  // laptop window — the shell scrolls, the card keeps its shape.
  "max-h-[calc(100dvh-2rem)] overflow-y-auto";

const SIZE_CLASS = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
  full: "sm:max-w-[min(92vw,64rem)]",
} as const;

export type StoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Small uppercase label above the title. */
  kicker?: React.ReactNode;
  /** The sentence the dialog is about. Display type, so keep it short. */
  title: React.ReactNode;
  /** One line under the title explaining what happens next. */
  lede?: React.ReactNode;
  size?: keyof typeof SIZE_CLASS;
  /** Hide the title visually but keep it for screen readers. */
  hideHeader?: boolean;
  className?: string;
  contentClassName?: string;
  children?: React.ReactNode;
};

export const StoryDialog = ({
  open,
  onOpenChange,
  kicker,
  title,
  lede,
  size = "md",
  hideHeader = false,
  className,
  contentClassName,
  children,
}: StoryDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      closeButton={false}
      className={cn(STORY_DIALOG_SURFACE, SIZE_CLASS[size], className)}
    >
      <StoryDialogClose />

      {hideHeader ? (
        <DialogTitle className="sr-only">{title}</DialogTitle>
      ) : (
        <header className="pr-8 text-left">
          {kicker && <Kicker>{kicker}</Kicker>}
          <DialogTitle
            className={cn("story-display text-[1.75rem] leading-tight text-story-ink", kicker && "pt-3")}
          >
            {title}
          </DialogTitle>
          {lede && (
            <DialogDescription className="mt-3 text-[0.9375rem] leading-relaxed text-story-muted">
              {lede}
            </DialogDescription>
          )}
        </header>
      )}

      <div className={cn(!hideHeader && "mt-6", contentClassName)}>{children}</div>
    </DialogContent>
  </Dialog>
);

/** The close affordance, in the site's own weight rather than a faint grey ×. */
export const StoryDialogClose = ({ className }: { className?: string }) => (
  <DialogPrimitive.Close
    className={cn(
      "absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-story-muted",
      "transition-colors hover:bg-story-ink/[0.06] hover:text-story-ink",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-story-green focus-visible:ring-offset-2",
      className,
    )}
  >
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
    <span className="sr-only">Close</span>
  </DialogPrimitive.Close>
);

/**
 * The action row. Reversed on phones so the affirmative button sits under the
 * thumb rather than beside it.
 */
export const StoryDialogActions = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end", className)}>{children}</div>
);

/* ── Form parts ────────────────────────────────────────────────────────── */

/** The one input look, so a field reads the same in every dialog and form. */
export const storyInputClass =
  "h-12 w-full rounded-xl border-[1.5px] border-story-ink/12 bg-white px-4 font-sans text-[0.9375rem] " +
  "text-story-ink placeholder:text-story-muted-2 focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-story-green focus-visible:ring-offset-0 disabled:opacity-60";

export const StoryInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => <input ref={ref} className={cn(storyInputClass, className)} {...rest} />,
);
StoryInput.displayName = "StoryInput";

/** Label plus field, with room for the error the field can produce. */
export const StoryField = ({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    <label htmlFor={htmlFor} className="text-[0.8125rem] font-bold text-story-ink-2">
      {label}
    </label>
    {children}
    {error ? (
      <p className="text-[0.8125rem] font-medium text-story-amber-dark">{error}</p>
    ) : (
      hint && <p className="text-[0.8125rem] text-story-muted-2">{hint}</p>
    )}
  </div>
);
