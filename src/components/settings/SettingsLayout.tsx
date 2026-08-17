import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { StoryAppLayout } from "@/components/story/StoryAppLayout";

/**
 * Settings destinations.
 *
 * These were previously "Profile / Security / Notifications / Data & Privacy /
 * Help & Support" — but /account/privacy and /account/help have never been
 * routes, so both fell through to the 404 page, while /account/country existed
 * and was missing from the list entirely.
 */
const SETTINGS_ITEMS = [
  { title: "Profile", url: "/account" },
  { title: "Security", url: "/account/security" },
  { title: "Notifications", url: "/account/notifications" },
  { title: "Country", url: "/account/country" },
];

/**
 * A horizontal rail on phones, a vertical one from `lg` up. The old layout
 * branched on `window.innerWidth` at first render, which never re-evaluated on
 * resize or rotation; this is the same nav at both sizes, chosen by CSS.
 */
const SettingsNav = () => (
  <nav aria-label="Settings" className="lg:w-52 lg:shrink-0">
    <ul className="story-rail -mx-1 flex gap-1.5 px-1 pb-1 lg:mx-0 lg:flex-col lg:px-0 lg:pb-0">
      {SETTINGS_ITEMS.map((item) => (
        <li key={item.url} className="shrink-0 lg:w-full">
          <NavLink
            to={item.url}
            end
            className={({ isActive }) =>
              cn(
                "block whitespace-nowrap rounded-full px-4 py-2.5 text-[0.875rem] font-bold no-underline transition-colors lg:rounded-xl",
                isActive
                  ? "bg-story-green-wash text-story-green-dark"
                  : "text-story-ink-2 hover:bg-story-ink/[0.05]",
              )
            }
          >
            {item.title}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);

interface SettingsLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function SettingsLayout({ children, title }: SettingsLayoutProps) {
  return (
    <StoryAppLayout title={title} lede="Manage your account and how Milk Me Not reaches you." width="wide">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <SettingsNav />
        <div className="story-hairline min-w-0 flex-1 rounded-3xl bg-white p-5 md:p-7">{children}</div>
      </div>
    </StoryAppLayout>
  );
}
