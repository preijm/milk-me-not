
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ChartPie, Table, PlusCircle, Info, User, Menu, X } from "lucide-react";
import { AuthButton } from "./AuthButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const links = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/dashboard", icon: ChartPie, label: "Dashboard" },
    { to: "/results", icon: Table, label: "Results" },
    ...(session ? [
      { to: "/add", icon: PlusCircle, label: "Add Test" },
      { to: "/my-results", icon: User, label: "My Results" }
    ] : []),
    { to: "/about", icon: Info, label: "About" },
  ];

  const currentPage = links.find(link => link.to === location.pathname)?.label || "";

  const linkClasses = (isActive: boolean) => cn(`
    flex items-center gap-2 px-4 py-2 rounded-md transition-colors 
    text-white 
    ${isActive 
      ? "bg-green-400 hover:bg-green-500" 
      : "bg-blue-400 hover:bg-blue-500"
    }
  `);

  return (
    <nav className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg shadow-md p-4 mb-8">
      {isMobile ? (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <CollapsibleTrigger className="p-2">
                {isOpen ? (
                  <X className="h-6 w-6 text-white" />
                ) : (
                  <Menu className="h-6 w-6 text-white" />
                )}
              </CollapsibleTrigger>
              <span className="text-white font-medium">{currentPage}</span>
            </div>
            <AuthButton />
          </div>
          <CollapsibleContent>
            <div className="flex flex-col gap-2">
              {links.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={linkClasses(location.pathname === to)}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {links.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={linkClasses(location.pathname === to)}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
          <AuthButton />
        </div>
      )}
    </nav>
  );
};
