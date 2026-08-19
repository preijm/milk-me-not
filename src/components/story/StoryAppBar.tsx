import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ScanFlow } from "./ScanFlow";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { DropGlyph } from "./motifs";

/**
 * Bottom navigation for the signed-in app pages on narrow viewports.
 *
 * The public pages deliberately give a phone one call to action rather than a
 * tab bar — the pitch is the job there. Past the sign-in these pages *are* the
 * tool, so navigation earns the space back. Same palette and type as the story
 * surface, so crossing from /results into /add no longer changes products.
 */

const ICON = "h-[1.35rem] w-[1.35rem]";

const ScanIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={ICON} aria-hidden>
    <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
    <path d="M4 12h16" />
  </svg>
);

const BoardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" className={ICON} aria-hidden>
    <path d="M5 20V11M12 20V5M19 20v-6" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={ICON} aria-hidden>
    <path d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5" />
    <path d="M10.3 19a2 2 0 0 0 3.4 0" />
  </svg>
);

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={ICON} aria-hidden>
    <circle cx="12" cy="8.5" r="3.6" />
    <path d="M5 20c1.2-3.6 3.8-5.4 7-5.4s5.8 1.8 7 5.4" />
  </svg>
);

/**
 * Home is deliberately absent. The wordmark in the sticky header goes home from
 * every page, and for someone already signed in "home" is the marketing page —
 * the least useful place in the bar. Scanning earns the slot instead: checking
 * what the board thinks of a carton in your hand is a different intent from
 * rating one, so it does not belong folded into the centre action.
 */
const TABS = [
  { to: "/results", label: "Board", icon: BoardIcon, match: (p: string) => p.startsWith("/results") },
  { to: "/notifications", label: "Alerts", icon: BellIcon, match: (p: string) => p.startsWith("/notifications") },
  { to: "/profile", label: "You", icon: PersonIcon, match: (p: string) => p.startsWith("/profile") },
];

export const StoryAppBar = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const [scanning, setScanning] = useState(false);
  const onRate = location.pathname.startsWith("/add");

  return (
    <nav
      aria-label="Member"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-story-ink/[0.07] bg-story-cream/95 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 items-end px-2">
        <li>
          <button
            type="button"
            onClick={() => setScanning(true)}
            className="flex w-full flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-story-muted transition-colors"
          >
            <ScanIcon />
            <span className="text-[0.625rem] font-extrabold tracking-[0.02em]">Scan</span>
          </button>
        </li>
        {TABS.slice(0, 1).map((tab) => (
          <Tab key={tab.to} tab={tab} active={tab.match(location.pathname)} />
        ))}

        {/* The rating flow is the whole point of the account — it gets the
            centre slot and the only filled treatment on the bar. */}
        <li className="flex justify-center">
          <Link
            to="/add"
            aria-label="Rate a milk"
            aria-current={onRate ? "page" : undefined}
            className={cn(
              "-mt-5 flex h-14 w-14 flex-col items-center justify-center rounded-full no-underline transition-transform",
              "story-lift-green active:scale-95",
              onRate ? "bg-story-green-dark" : "bg-story-green",
            )}
          >
            <DropGlyph className="h-6 w-6 text-white" />
            <span className="mt-0.5 text-[0.5625rem] font-extrabold uppercase tracking-[0.12em] text-white">Rate</span>
          </Link>
        </li>

        {TABS.slice(1).map((tab) => (
          <Tab
            key={tab.to}
            tab={tab}
            active={tab.match(location.pathname)}
            badge={tab.to === "/notifications" ? unreadCount : 0}
          />
        ))}
      </ul>

      <ScanFlow open={scanning} onClose={() => setScanning(false)} />
    </nav>
  );
};

const Tab = ({
  tab,
  active,
  badge = 0,
}: {
  tab: (typeof TABS)[number];
  active: boolean;
  badge?: number;
}) => {
  const Icon = tab.icon;
  return (
    <li>
      <Link
        to={tab.to}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 no-underline transition-colors",
          active ? "text-story-green-dark" : "text-story-muted",
        )}
      >
        <span className="relative">
          <Icon />
          {badge > 0 && (
            <span
              className="absolute -right-1.5 -top-1 h-2.5 w-2.5 rounded-full border-2 border-story-cream bg-story-amber"
              aria-hidden
            />
          )}
        </span>
        <span className="text-[0.625rem] font-extrabold tracking-[0.02em]">{tab.label}</span>
      </Link>
    </li>
  );
};

export default StoryAppBar;
