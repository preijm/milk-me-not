import React from "react";
import { useNavigate } from "react-router-dom";
import { LucideIcon, ChevronRight } from "lucide-react";

export interface MenuItem {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  title: string;
  description: string;
  path?: string;
  onClick?: () => void;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MobileSettingsMenuProps {
  sections: MenuSection[];
}

export const MobileSettingsMenu = ({ sections }: MobileSettingsMenuProps) => {
  const navigate = useNavigate();

  const handleItemClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="text-xs font-bold text-foreground uppercase mb-2 px-1 tracking-wide">
            {section.title}
          </h3>

          <div className="bg-card rounded-2xl overflow-hidden divide-y divide-border shadow-sm">
            {section.items.map((item) => (
              <button
                key={item.title}
                onClick={() => handleItemClick(item)}
                className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: item.iconBgColor }}
                >
                  <item.icon
                    className="w-4.5 h-4.5"
                    style={{ color: item.iconColor }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                {item.path && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
