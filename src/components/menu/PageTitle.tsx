import { LucideIcon, Bell, Radio, BarChart3, Plus, Settings, User, Lock, Globe, Smartphone, HelpCircle, Mail, Info } from "lucide-react";

interface PageTitleConfig {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}

interface PageTitleProps {
  pathname: string;
  unreadCount: number;
  isMobileOrTablet: boolean;
}

const getPageTitleConfig = (
  pathname: string, 
  unreadCount: number,
  isMobileOrTablet: boolean
): PageTitleConfig | null => {
  // Account sub-pages only show on mobile/tablet
  if (isMobileOrTablet) {
    if (pathname === '/account/notifications') {
      return { icon: Bell, title: 'Notifications' };
    }
    if (pathname === '/account/security') {
      return { icon: Lock, title: 'Security' };
    }
    if (pathname === '/account/country') {
      return { icon: Globe, title: 'Country' };
    }
    if (pathname === '/account/profile') {
      return { icon: User, title: 'Profile' };
    }
    if (pathname === '/account') {
      return { icon: Settings, title: 'Settings' };
    }
  }

  // Common pages
  if (pathname === '/add') {
    return { icon: Plus, title: 'Add Test' };
  }
  if (pathname === '/notifications') {
    return { 
      icon: Bell, 
      title: 'Notifications',
      subtitle: unreadCount > 0 ? `${unreadCount} unread` : undefined
    };
  }
  if (pathname === '/feed') {
    return { icon: Radio, title: 'Feed' };
  }
  if (pathname === '/profile') {
    return { icon: User, title: 'Profile' };
  }
  if (pathname.startsWith('/product/')) {
    return { icon: BarChart3, title: 'Result Details' };
  }
  if (pathname === '/results') {
    return { icon: BarChart3, title: 'Results' };
  }
  if (pathname === '/mobile-app') {
    return { icon: Smartphone, title: 'Get the Mobile App' };
  }
  if (pathname === '/faq') {
    return { icon: HelpCircle, title: 'FAQ' };
  }
  if (pathname === '/contact') {
    return { icon: Mail, title: 'Contact' };
  }
  if (pathname === '/about') {
    return { icon: Info, title: 'About' };
  }

  return null;
};

const getSimplePageTitle = (pathname: string): string | null => {
  switch (pathname) {
    case '/results':
      return 'Results';
    case '/profile':
      return 'Profile';
    case '/about':
      return 'About';
    case '/contact':
      return 'Get in Touch';
    case '/account':
      return 'Settings';
    default:
      return null;
  }
};

export const PageTitle = ({ pathname, unreadCount, isMobileOrTablet }: PageTitleProps) => {
  const config = getPageTitleConfig(pathname, unreadCount, isMobileOrTablet);
  
  if (config) {
    const Icon = config.icon;
    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-primary">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{config.title}</h1>
          {config.subtitle && <p className="text-xs text-gray-500">{config.subtitle}</p>}
        </div>
      </div>
    );
  }

  // Fallback to simple text title
  const simpleTitle = getSimplePageTitle(pathname);
  if (simpleTitle) {
    return <h1 className="text-gray-800 text-xl font-semibold">{simpleTitle}</h1>;
  }

  return null;
};
