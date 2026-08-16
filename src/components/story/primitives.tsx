/**
 * Story primitives — the small set of parts every public page is built from.
 *
 * The point of keeping them here is rhythm: bands, kickers, display type and
 * the one call to action all behave identically on the homepage, the FAQ and a
 * public profile, so the site reads as one thing rather than eleven.
 */

import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { DropGlyph } from "./motifs";
import { getTier } from "./tiers";
import { GROUND_CLASS, type BandGround } from "./grounds";

/* ── Bands ─────────────────────────────────────────────────────────────── */

export type BandProps = {
  ground?: BandGround;
  /** Vertical rhythm. `hero` is the first band on a page. */
  size?: "hero" | "lg" | "md" | "sm";
  /** Max width of the inner column. `full` opts out of the container. */
  width?: "narrow" | "prose" | "wide" | "full";
  className?: string;
  innerClassName?: string;
  id?: string;
  children: React.ReactNode;
};

const SIZE_CLASS = {
  hero: "pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-20 lg:pb-28",
  lg: "py-16 sm:py-20 lg:py-28",
  md: "py-12 sm:py-16 lg:py-20",
  sm: "py-9 sm:py-12",
} as const;

const WIDTH_CLASS = {
  narrow: "mx-auto w-full max-w-3xl px-5 sm:px-8",
  prose: "mx-auto w-full max-w-[46rem] px-5 sm:px-8",
  wide: "mx-auto w-full max-w-[76rem] px-5 sm:px-8 lg:px-10",
  full: "w-full",
} as const;

export const Band = ({
  ground = "cream",
  size = "lg",
  width = "wide",
  className,
  innerClassName,
  id,
  children,
}: BandProps) => (
  <section id={id} className={cn("relative overflow-hidden", GROUND_CLASS[ground], SIZE_CLASS[size], className)}>
    <div className={cn(WIDTH_CLASS[width], "relative z-10", innerClassName)}>{children}</div>
  </section>
);

/* ── Type ──────────────────────────────────────────────────────────────── */

const DISPLAY_SIZE = {
  hero: "text-[clamp(2.85rem,10.5vw,5.75rem)]",
  xl: "text-[clamp(2.35rem,7.5vw,4.25rem)]",
  lg: "text-[clamp(1.95rem,5.6vw,3.15rem)]",
  md: "text-[clamp(1.5rem,4vw,2.25rem)]",
  sm: "text-[clamp(1.25rem,3vw,1.6rem)]",
} as const;

export type DisplayProps = {
  as?: "h1" | "h2" | "h3" | "p" | "div";
  size?: keyof typeof DISPLAY_SIZE;
  className?: string;
  children: React.ReactNode;
};

export const Display = ({ as: Tag = "h2", size = "lg", className, children }: DisplayProps) => (
  <Tag className={cn("story-display", DISPLAY_SIZE[size], className)}>{children}</Tag>
);

/** Small uppercase label with a rule — opens most sections. */
export const Kicker = ({
  children,
  className,
  tone = "green",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "green" | "ink" | "light";
}) => (
  <p
    className={cn(
      "story-kicker flex items-center gap-3",
      tone === "green" && "text-story-green-dark",
      tone === "ink" && "text-story-muted",
      tone === "light" && "text-white/70",
      className,
    )}
  >
    <span
      aria-hidden
      className={cn(
        "h-px w-7 flex-shrink-0",
        tone === "green" && "bg-story-green",
        tone === "ink" && "bg-story-muted/50",
        tone === "light" && "bg-white/50",
      )}
    />
    {children}
  </p>
);

/** Body copy at intro scale. */
export const Lede = ({
  children,
  className,
  tone = "muted",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "muted" | "light" | "ink";
}) => (
  <p
    className={cn(
      "text-[1.0625rem] leading-[1.6] sm:text-lg sm:leading-[1.65]",
      tone === "muted" && "text-story-muted",
      tone === "light" && "text-white/80",
      tone === "ink" && "text-story-ink-2",
      className,
    )}
  >
    {children}
  </p>
);

/* ── Actions ───────────────────────────────────────────────────────────── */

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2.5 rounded-full font-sans font-bold tracking-[-0.01em] " +
  "transition-[transform,filter,background-color,color] duration-150 active:scale-[0.985] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-story-green " +
  "disabled:pointer-events-none disabled:opacity-50";

const BUTTON_SIZE = {
  lg: "px-7 py-4 text-[1.0625rem]",
  md: "px-6 py-3.5 text-[0.9375rem]",
  sm: "px-5 py-2.5 text-sm",
} as const;

const BUTTON_TONE = {
  green: "bg-story-green text-white story-lift-green hover:brightness-[1.07]",
  ink: "bg-story-ink text-story-cream hover:brightness-125",
  paper: "bg-white text-story-ink shadow-[0_10px_26px_-14px_rgba(27,36,33,0.5)] hover:bg-story-cream",
  outline: "border-[1.5px] border-story-ink/15 bg-transparent text-story-ink hover:bg-story-ink/[0.05]",
  "outline-light": "border-[1.5px] border-white/35 bg-transparent text-white hover:bg-white/10",
} as const;

export type StoryButtonProps = {
  tone?: keyof typeof BUTTON_TONE;
  size?: keyof typeof BUTTON_SIZE;
  className?: string;
  children: React.ReactNode;
};

export const StoryButton = forwardRef<
  HTMLButtonElement,
  StoryButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ tone = "green", size = "lg", className, children, ...rest }, ref) => (
  <button ref={ref} className={cn(BUTTON_BASE, BUTTON_SIZE[size], BUTTON_TONE[tone], className)} {...rest}>
    {children}
  </button>
));
StoryButton.displayName = "StoryButton";

export const StoryLinkButton = ({
  to,
  tone = "green",
  size = "lg",
  className,
  children,
  ...rest
}: StoryButtonProps & { to: string } & Omit<React.ComponentProps<typeof Link>, "to" | "className" | "children">) => (
  <Link to={to} className={cn(BUTTON_BASE, BUTTON_SIZE[size], BUTTON_TONE[tone], "no-underline", className)} {...rest}>
    {children}
  </Link>
);

export const ArrowRight = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" className={className} aria-hidden>
    <path d="M5 12h13m-5.5-6.5L19 12l-6.5 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Data display ──────────────────────────────────────────────────────── */

/**
 * The community verdict, rendered as the page's biggest number plus its tier
 * name. This is the site's product shot.
 */
export const ScoreMark = ({
  score,
  size = "md",
  showTier = true,
  className,
}: {
  score: number | null | undefined;
  size?: "sm" | "md" | "lg" | "xl";
  showTier?: boolean;
  className?: string;
}) => {
  const tier = getTier(score);
  const value = score === null || score === undefined || Number.isNaN(score) ? "—" : score.toFixed(1);
  const numClass = {
    sm: "text-[1.35rem]",
    md: "text-[2rem]",
    lg: "text-[3.25rem]",
    xl: "text-[clamp(3.5rem,13vw,5.5rem)]",
  }[size];
  const tierClass = {
    sm: "text-[0.625rem] tracking-[0.14em]",
    md: "text-[0.6875rem] tracking-[0.14em]",
    lg: "text-xs tracking-[0.16em]",
    xl: "text-sm tracking-[0.16em]",
  }[size];

  return (
    <div className={cn("flex items-baseline gap-2.5", className)}>
      <span className={cn("story-num leading-none", numClass)} style={{ color: tier.color }}>
        {value}
      </span>
      {showTier && (
        <span className={cn("font-sans font-bold uppercase", tierClass)} style={{ color: tier.color }}>
          {tier.name}
        </span>
      )}
    </div>
  );
};

/** A single headline statistic. */
export const StatFigure = ({
  value,
  label,
  tone = "ink",
  className,
}: {
  value: React.ReactNode;
  label: string;
  tone?: "ink" | "light" | "green";
  className?: string;
}) => (
  <div className={cn("flex flex-col gap-1", className)}>
    <span
      className={cn(
        "story-num text-[clamp(2.1rem,6vw,3.25rem)] leading-none",
        tone === "ink" && "text-story-ink",
        tone === "light" && "text-white",
        tone === "green" && "text-story-green",
      )}
    >
      {value}
    </span>
    <span
      className={cn(
        "story-kicker",
        tone === "light" ? "text-white/60" : "text-story-muted-2",
      )}
    >
      {label}
    </span>
  </div>
);

/** White card with the site's standard hairline + radius. */
export const StoryCard = ({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}) => (
  <Tag className={cn("story-hairline rounded-[1.25rem] bg-white", className)}>{children}</Tag>
);

/** Section opener: kicker + display heading + optional lede and trailing slot. */
export const SectionHead = ({
  kicker,
  title,
  lede,
  trailing,
  tone = "ink",
  size = "lg",
  className,
}: {
  kicker?: React.ReactNode;
  title: React.ReactNode;
  lede?: React.ReactNode;
  trailing?: React.ReactNode;
  tone?: "ink" | "light";
  size?: keyof typeof DISPLAY_SIZE;
  className?: string;
}) => (
  <div className={cn("flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-10", className)}>
    <div className="max-w-2xl">
      {kicker && <Kicker tone={tone === "light" ? "light" : "green"}>{kicker}</Kicker>}
      <Display size={size} className={cn(kicker && "mt-4", tone === "light" && "text-white")}>
        {title}
      </Display>
      {lede && <Lede tone={tone === "light" ? "light" : "muted"} className="mt-4">{lede}</Lede>}
    </div>
    {trailing && <div className="flex-shrink-0">{trailing}</div>}
  </div>
);

/** Bulleted list that uses the drop as its marker. */
export const DropList = ({
  items,
  tone = "ink",
  className,
}: {
  items: React.ReactNode[];
  tone?: "ink" | "light";
  className?: string;
}) => (
  <ul className={cn("flex flex-col gap-3", className)}>
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-3">
        <DropGlyph size={14} className={cn("mt-1 flex-shrink-0", tone === "light" ? "text-story-green-light" : "text-story-green")} />
        <span className={cn("text-[0.9375rem] leading-relaxed", tone === "light" ? "text-white/80" : "text-story-ink-2")}>
          {item}
        </span>
      </li>
    ))}
  </ul>
);
