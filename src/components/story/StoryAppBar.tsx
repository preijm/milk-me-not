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

const FeedIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={ICON} aria-hidden>
    <rect x="3.5" y="4.5" width="17" height="7" rx="2" />
    <path d="M3.5 15.5h11M3.5 19.5h7" />
  </svg>
);

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={ICON} aria-hidden>
    <circle cx="12" cy="8.5" r="3.6" />
    <path d="M5 20c1.2-3.6 3.8-5.4 7-5.4s5.8 1.8 7 5.4" />
  </svg>
);

/**
 * Five slots, and what earns them.
 *
 * Scanning stays: checking what the community thinks of a carton in your hand
 * is a different intent from rating one, so it does not fold into the centre
 * action. Home is absent because for a signed-in reader "home" resolves to the
 * feed, which now has a tab of its own anyway.
 *
 * Alerts folded into You. Likes and comments are low volume here, so a tab each
 * for notifications and profile spent two of five slots on the two things a
 * reader opens least — and the feed, which is the whole point of a community,
 * had none. Notifications keep their route for email links, the unread dot
 * moves to You, and the profile page leads with them when anything is unread.
 *
 * "Scoreboard", and it took four goes to get there.
 *
 * That destination once answered to five different names — Board here,
 * Discover in the header, All ratings in the footer, The full catalogue on the
 * page, Results in the title — so the first job was picking one and using it
 * everywhere, which "Discover" did.
 *
 * What "Discover" never did was say where you were going. It named a mood, and
 * readers said so. Three replacements were tried and rejected:
 *
 * "Rankings" collided with the page's own view switcher, whose first tab was
 * called Ranking — naming a destination after one of its three views invites
 * the question of whether they are the same thing. That tab is called Table
 * now, which is what its key always was, and which leaves Table / Charts / Map
 * as three formats rather than one semantic and two formats.
 *
 * "Ratings" is the plain word everyone reaches for first, and it points at the
 * wrong page. This one lists a row per *product* with its ratings averaged;
 * the page that is a list of ratings is the Feed. It would also have sat two
 * lines above the footer's "Latest ratings", which goes somewhere else.
 *
 * "Milks" read clearly but invited two arguments nobody needs — EU labelling
 * reserves "milk" for the animal kind, which is why the cartons in the photos
 * say DRINK, and readers start the is-it-really-milk fight rather than
 * clicking.
 *
 * "Scoreboard" is the family the copy had been using all along while the
 * navigation went its own way. The board is everywhere in front of readers —
 * "New to the board", "What the board has", "Every brand on the board", "The
 * board right now", TOP OF THE BOARD on the home card — so this is the
 * navigation catching up rather than a sixth name.
 *
 * Not "Board" alone, which could be a forum. Not "Leaderboard", which the two
 * "See the ..." buttons used to say: it implies the top, and this page holds
 * all 226 products, most of which lead nothing. Those two buttons say
 * scoreboard now. The plain "the board" prose is left alone — it reads as
 * shorthand for this page, not as a competing name for it.
 */
const TABS = [
  { to: "/feed", label: "Feed", icon: FeedIcon, match: (p: string) => p.startsWith("/feed") },
  { to: "/results", label: "Scoreboard", icon: BoardIcon, match: (p: string) => p.startsWith("/results") },
  {
    to: "/profile",
    label: "You",
    icon: PersonIcon,
    // Highlighted on the notifications page too, since that is now reached
    // through this tab rather than beside it.
    match: (p: string) => p.startsWith("/profile") || p.startsWith("/notifications"),
  },
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
            badge={tab.to === "/profile" ? unreadCount : 0}
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
