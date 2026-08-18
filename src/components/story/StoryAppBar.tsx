import { Link, useLocation } from "react-router-dom";
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

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={ICON} aria-hidden>
    <path d="M3.5 10.5 12 4l8.5 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-6v5H4.5a1 1 0 0 1-1-1z" />
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

const TABS = [
  { to: "/", label: "Home", icon: HomeIcon, match: (p: string) => p === "/" },
  { to: "/results", label: "Board", icon: BoardIcon, match: (p: string) => p.startsWith("/results") },
  { to: "/notifications", label: "Alerts", icon: BellIcon, match: (p: string) => p.startsWith("/notifications") },
  { to: "/profile", label: "You", icon: PersonIcon, match: (p: string) => p.startsWith("/profile") },
];

export const StoryAppBar = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const onRate = location.pathname.startsWith("/add");

  return (
    <nav
      aria-label="Member"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-story-ink/[0.07] bg-story-cream/95 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 items-end px-2">
        {TABS.slice(0, 2).map((tab) => (
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

        {TABS.slice(2).map((tab) => (
          <Tab
            key={tab.to}
            tab={tab}
            active={tab.match(location.pathname)}
            badge={tab.to === "/notifications" ? unreadCount : 0}
          />
        ))}
      </ul>
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
