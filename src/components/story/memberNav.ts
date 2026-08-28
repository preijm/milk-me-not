/**
 * Member destinations, shared by the desktop account menu and the Settings
 * page. Kept out of the component files so fast refresh keeps working — see
 * the react-refresh/only-export-components rule.
 */

/**
 * What the desktop account menu offers.
 *
 * Notifications used to be here too. They have a bell in the header now, on
 * both breakpoints, so listing them again a click away was the same
 * destination twice in the same corner of the screen.
 */
export const MEMBER_LINKS = [
  { to: "/profile", label: "My ratings" },
  { to: "/account", label: "Settings" },
];

/**
 * Occasional-use destinations. A signed-in reader finds these under Settings,
 * a visitor finds them in the footer.
 *
 * They used to live in a mobile drawer as well, which existed for little else.
 * Nobody opens "About" twice a week, but help and a route to a human have to
 * stay findable — signed-in readers are exactly the people who go looking.
 */
export const SECONDARY_LINKS = [
  { to: "/faq", label: "How ratings work" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/mobile-app", label: "Android app" },
  { to: "/install-guide", label: "Install guide" },
  { to: "/privacy", label: "Privacy" },
];
