import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { StoryHeader } from "./StoryHeader";
import { StoryAppBar } from "./StoryAppBar";

const FOOTER_LINKS = [
  { to: "/results", label: "Discover" },
  { to: "/faq", label: "How ratings work" },
  { to: "/contact", label: "Contact" },
];

/**
 * A deliberately quiet footer for the signed-in pages.
 *
 * StoryFooter closes with a full marketing band — the right ending for a page
 * that is still selling, the wrong one under a settings form the reader is
 * already inside. Same palette and type, a fraction of the volume.
 */
const AppFooter = () => (
  <footer className="mt-auto border-t border-story-ink/[0.07] px-5 py-7 sm:px-8 lg:px-10">
    <div className="mx-auto flex max-w-[76rem] flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-[0.75rem] font-semibold text-story-muted-2">
        Milk Me Not — rated by people who actually drank it.
      </p>
      <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
        {FOOTER_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="text-[0.75rem] font-bold text-story-muted no-underline transition-colors hover:text-story-green-dark"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  </footer>
);

export type StoryAppLayoutProps = {
  children: React.ReactNode;
  /** Page title, set in story display type. Omit for pages that own their head. */
  title?: string;
  /** One line under the title saying what the page is for. */
  lede?: string;
  /** Constrain the body column. Settings forms want narrow; grids want wide. */
  width?: "narrow" | "wide";
  /** Renders a back link above the title, for sub-steps of a larger flow. */
  back?: { to: string; label: string };
  className?: string;
};

const BackArrow = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
    <path d="M19 12H6m5.5 6.5L5 12l6.5-6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * The shell the signed-in pages share.
 *
 * Same header, palette, type and grounds as the public story pages, so the
 * crossing from /results into /add does not change products — but with member
 * navigation in place of the marketing call to action, because someone on this
 * side of the sign-in has already been sold.
 */
export const StoryAppLayout = ({ children, title, lede, width = "narrow", back, className }: StoryAppLayoutProps) => {
  const location = useLocation();
  // Pointing the header CTA at the page you are already on reads as a dead end.
  const onRateFlow = location.pathname.startsWith("/add");

  return (
    <div className={cn("story-surface flex min-h-dvh flex-col", className)}>
      <StoryHeader hideCta={onRateFlow} />

      <main className="flex-1 px-5 pb-24 pt-8 sm:px-8 lg:px-10 lg:pb-16 lg:pt-12">
        <div className={cn("mx-auto w-full", width === "narrow" ? "max-w-2xl" : "max-w-[76rem]")}>
          {back && (
            <Link
              to={back.to}
              className="mb-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-story-muted no-underline transition-colors hover:text-story-green-dark"
            >
              <BackArrow />
              {back.label}
            </Link>
          )}
          {title && (
            <header className="mb-7 lg:mb-9">
              <h1 className="story-display text-[2rem] text-story-ink sm:text-[2.4rem]">{title}</h1>
              {lede && <p className="mt-2 max-w-prose text-[0.9375rem] text-story-muted">{lede}</p>}
            </header>
          )}
          {children}
        </div>
      </main>

      <div className="pb-[4.75rem] lg:pb-0">
        <AppFooter />
      </div>
      <StoryAppBar />
    </div>
  );
};

export default StoryAppLayout;
