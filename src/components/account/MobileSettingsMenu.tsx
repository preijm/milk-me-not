import React from "react";
import { useNavigate } from "react-router-dom";
import { LucideIcon, ChevronRight } from "lucide-react";

interface MenuItem {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  title: string;
  description: string;
  path: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MobileSettingsMenuProps {
  sections: MenuSection[];
}

export const MobileSettingsMenu = ({ sections }: MobileSettingsMenuProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="text-sm font-bold text-foreground uppercase mb-4 px-1 tracking-wide">
            {section.title}
          </h3>

          <div className="bg-card rounded-2xl overflow-hidden divide-y divide-border shadow-sm">
            {section.items.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: item.iconBgColor }}
                >
                  <item.icon
                    className="w-6 h-6"
                    style={{ color: item.iconColor }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
