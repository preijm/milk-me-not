import { User, Shield, Bell, Globe, HelpCircle } from "lucide-react";

export const accountMenuSections = [
  {
    title: "Account",
    items: [
      {
        icon: User,
        iconBgColor: "#dbeafe",
        iconColor: "#2563eb",
        title: "Profile",
        description: "Edit your personal information",
        path: "/account/profile",
      },
      {
        icon: Shield,
        iconBgColor: "#f3e8ff",
        iconColor: "#9333ea",
        title: "Security",
        description: "Password and authentication",
        path: "/account/security",
      },
    ],
  },
  {
    title: "Preferences",
    items: [
      {
        icon: Bell,
        iconBgColor: "#ffedd5",
        iconColor: "#ea580c",
        title: "Notifications",
        description: "Manage your alerts",
        path: "/account/notifications",
      },
      {
        icon: Globe,
        iconBgColor: "#dcfce7",
        iconColor: "#16a34a",
        title: "Country",
        description: "Set your default location",
        path: "/account/country",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        icon: HelpCircle,
        iconBgColor: "#fef9c3",
        iconColor: "#ca8a04",
        title: "Contact",
        description: "Reach out to our team",
        path: "/contact",
      },
      {
        icon: HelpCircle,
        iconBgColor: "#dcfce7",
        iconColor: "#16a34a",
        title: "About",
        description: "Learn about our story",
        path: "/about",
      },
    ],
  },
];
