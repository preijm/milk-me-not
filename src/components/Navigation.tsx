import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ChartPie, Table, PlusCircle, Info, User } from "lucide-react";
import { AuthButton } from "./AuthButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Navigation = () => {
  const location = useLocation();
  
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

  return (
    <nav className="bg-white rounded-lg shadow-md p-4 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                location.pathname === to
                  ? "bg-cream-200 text-milk-500"
                  : "hover:bg-cream-100 text-milk-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
        <AuthButton />
      </div>
    </nav>
  );
};