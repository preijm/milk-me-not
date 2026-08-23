import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import logoImg from "@/assets/logo-96.png";
import { StoryButton, ArrowRight } from "./primitives";
import { useRateCta } from "./useRateCta";
import { StoryAccountMenu } from "./StoryAccountMenu";
import { MEMBER_DRAWER_LINKS, SECONDARY_LINKS } from "./memberNav";

const PUBLIC_LINKS = [
  { to: "/results", label: "Discover" },
  { to: "/feed", label: "Feed" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "How it works" },
];

const Wordmark = ({ tone, to = "/" }: { tone: "ink" | "light"; to?: string }) => (
  <Link to={to} className="flex items-center gap-2.5 no-underline" aria-label="Milk Me Not — home">
    <img src={logoImg} alt="" className="h-9 w-9 rounded-[0.55rem] object-contain" width={36} height={36} />
    <span
      translate="no"
      className={cn(
        "font-display text-[1.15rem] font-extrabold tracking-[-0.03em] sm:text-[1.3rem]",
        tone === "light" ? "text-white" : "text-story-ink",
      )}
    >
      Milk Me Not
    </span>
  </Link>
);

const Burger = ({ open }: { open: boolean }) => (
  <span className="relative block h-3.5 w-[18px]" aria-hidden>
    <span
      className={cn(
        "absolute left-0 h-[1.8px] w-full rounded bg-current transition-transform duration-200",
        open ? "top-[6px] rotate-45" : "top-0",
      )}
    />
    <span
      className={cn(
        "absolute left-0 top-[6px] h-[1.8px] w-full rounded bg-current transition-opacity duration-150",
        open && "opacity-0",
      )}
    />
    <span
      className={cn(
        "absolute left-0 h-[1.8px] w-full rounded bg-current transition-transform duration-200",
        open ? "top-[6px] -rotate-45" : "top-[12px]",
      )}
    />
  </span>
);

/**
 * The public site's header.
 *
 * One bar, two arrangements. Wide viewports get the nav inline; narrow ones get
 * the logo, the CTA and a drawer — the pitch is never traded away for a
 * navigation-first mobile view.
 */
export const StoryHeader = ({
  transparent = false,
  hideCta = false,
}: {
  transparent?: boolean;
  /** For pages the CTA already leads to — pointing back at itself reads as a dead loop. */
  hideCta?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const cta = useRateCta();
  const onAuthPage = location.pathname === "/auth";
  const home = user ? "/feed" : "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu when the route changes. Compared during render so the panel
  // is already gone in the frame the new page paints, rather than lingering for
  // one frame over it.
  const [seenPath, setSeenPath] = useState(location.pathname);
  if (seenPath !== location.pathname) {
    setSeenPath(location.pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = scrolled || !transparent;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-colors duration-200",
          solid ? "border-b border-story-ink/[0.07] bg-story-cream/90 backdrop-blur-xl" : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-[76rem] items-center gap-4 px-5 sm:px-8 lg:h-[4.5rem] lg:px-10">
          {/* For a member, home is the feed — `/` redirects there anyway, so
              linking straight at it saves a render hop and keeps the Feed nav
              item correctly marked as current. */}
          <Wordmark tone="ink" to={home} />

          <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Main">
            {PUBLIC_LINKS.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-[0.875rem] font-bold no-underline transition-colors",
                    active
                      ? "bg-story-green-wash text-story-green-dark"
                      : "text-story-ink-2 hover:bg-story-ink/[0.05]",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {!user && !onAuthPage && (
              <Link
                to="/auth"
                className="hidden rounded-full px-4 py-2 text-[0.875rem] font-bold text-story-ink-2 no-underline transition-colors hover:bg-story-ink/[0.05] lg:inline-flex"
              >
                Log in
              </Link>
            )}
            {!hideCta && (
              <StoryButton size="sm" onClick={cta.go} className="hidden lg:inline-flex">
                {cta.shortLabel}
                <ArrowRight />
              </StoryButton>
            )}
            {user && <StoryAccountMenu className="hidden lg:flex" />}

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-story-ink/10 bg-white text-story-ink transition-colors hover:bg-story-cream-2 lg:hidden"
            >
              <Burger open={open} />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer — full-height on phones so the menu is a place, not a dropdown. */}
      <div
        className={cn(
          "fixed inset-0 z-[60] lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-story-ink/45 transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-story-cream shadow-[-30px_0_70px_rgba(27,36,33,0.25)] transition-transform duration-[250ms] ease-out",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between px-5">
            <Wordmark tone="ink" to={home} />
            <button
              type="button"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-story-ink/10 bg-white text-story-ink"
            >
              <Burger open />
            </button>
          </div>

          {/* Signed out, this drawer is the whole navigation. Signed in, the
              bottom bar is — so the drawer drops Discover, My ratings and
              Notifications, which are Board, You and Alerts one thumb-width
              below it, and carries what the bar has no room for instead. */}
          <nav className="flex flex-col overflow-y-auto px-5 pt-4" aria-label="Mobile">
            {(user ? MEMBER_DRAWER_LINKS : PUBLIC_LINKS).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                tabIndex={open ? 0 : -1}
                className="flex items-center justify-between border-t border-story-ink/[0.08] py-4 font-display text-[1.4rem] font-bold tracking-[-0.03em] text-story-ink no-underline"
              >
                {link.label}
                <ArrowRight className="text-story-muted-2" />
              </Link>
            ))}
            {user && (
              <>
                <p className="story-kicker mt-7 pb-1 text-story-muted-2">More</p>
                {SECONDARY_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    tabIndex={open ? 0 : -1}
                    className="flex items-center justify-between border-t border-story-ink/[0.08] py-3.5 font-sans text-[0.9375rem] font-bold text-story-muted no-underline"
                  >
                    {link.label}
                    <ArrowRight className="text-story-muted-2" />
                  </Link>
                ))}
              </>
            )}
          </nav>

          <div className="mt-auto flex shrink-0 flex-col gap-2.5 p-5 pb-8">
            {/* No rating button for members: RATE is the centre of the bottom
                bar on every page, and a second one here is the same ask twice. */}
            {!hideCta && !user && (
              <StoryButton tabIndex={open ? 0 : -1} onClick={cta.go} className="w-full">
                {cta.label}
                <ArrowRight />
              </StoryButton>
            )}
            {!user && !onAuthPage && (
              <Link
                to="/auth"
                tabIndex={open ? 0 : -1}
                className="rounded-full border-[1.5px] border-story-ink/[0.12] py-3.5 text-center font-sans text-[0.9375rem] font-bold text-story-ink no-underline"
              >
                Log in
              </Link>
            )}
            {user && (
              <button
                type="button"
                tabIndex={open ? 0 : -1}
                onClick={async () => {
                  await signOut();
                  navigate("/");
                }}
                className="rounded-full border-[1.5px] border-story-ink/[0.12] py-3.5 text-center font-sans text-[0.9375rem] font-bold text-story-muted"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StoryHeader;
