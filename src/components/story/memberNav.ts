/**
 * Member destinations, shared by the desktop account menu and the mobile
 * drawer. Kept out of the component files so fast refresh keeps working —
 * see the react-refresh/only-export-components rule.
 */
export const MEMBER_LINKS = [
  { to: "/profile", label: "My ratings" },
  { to: "/notifications", label: "Notifications" },
  { to: "/account", label: "Account settings" },
];

/**
 * What the mobile drawer carries once you are signed in.
 *
 * The bottom bar already holds Board, Rate, Alerts and You. Listing those again
 * in the drawer is what made a member page feel like it had two navigations
 * arguing with each other, so this is only what the bar has no room for.
 */
export const MEMBER_DRAWER_LINKS = [
  { to: "/notifications", label: "Notifications" },
  { to: "/account", label: "Account settings" },
];

/**
 * Occasional-use destinations: demoted once you are signed in, never hidden.
 * Nobody opens "About" twice a week, but help and a route to a human have to
 * stay findable — signed-in readers are exactly the people who go looking.
 */
export const SECONDARY_LINKS = [
  { to: "/faq", label: "How ratings work" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/mobile-app", label: "Android app" },
  { to: "/install-guide", label: "Install guide" },
];
