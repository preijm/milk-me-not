import { NavLink, useLocation } from "react-router-dom";
import { User, Shield, Bell, Database, HelpCircle, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPattern from "@/components/BackgroundPattern";

const settingsItems = [
  { title: "Profile", url: "/account", icon: User },
  { title: "Security", url: "/account/security", icon: Shield },
  { title: "Notifications", url: "/account/notifications", icon: Bell },
  { title: "Data & Privacy", url: "/account/privacy", icon: Database },
  { title: "Help & Support", url: "/account/help", icon: HelpCircle },
];

function SettingsSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-60"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

interface SettingsLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function SettingsLayout({ children, title }: SettingsLayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const isMobileOrTablet = typeof window !== 'undefined' && window.innerWidth < 1024;
  
  // Find the current section's icon
  const currentItem = settingsItems.find(item => item.url === currentPath);
  const CurrentIcon = currentItem?.icon || User;
  
  // Mobile/Tablet layout
  if (isMobileOrTablet) {
    return (
      <div className="min-h-screen bg-white">
        <MenuBar />
        <div className="pt-14 pb-20 min-h-screen">
          <div className="p-4">
            {children}
          </div>
        </div>
        <MobileFooter />
      </div>
    );
  }
  
  // Desktop layout
  return (
    <div className="min-h-screen">
      <MenuBar />
      <SidebarProvider>
        <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
          <SidebarTrigger>
            <Menu className="h-4 w-4" />
          </SidebarTrigger>
          <div className="flex items-center gap-3 ml-3">
            <h1 className="text-base font-semibold">{title}</h1>
          </div>
        </header>
        
        <div className="flex min-h-screen w-full">
          <SettingsSidebar />
          
          <main className="flex-1 pt-16 pb-8">
            <BackgroundPattern>
              <div className="container max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 animate-fade-up">
                  {children}
                </div>
              </div>
            </BackgroundPattern>
          </main>
        </div>
      </SidebarProvider>
      <MobileFooter />
    </div>
  );
}