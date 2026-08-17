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
