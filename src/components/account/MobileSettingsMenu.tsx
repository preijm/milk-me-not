import React from "react";
import { useNavigate } from "react-router-dom";
import { LucideIcon, ChevronRight } from "lucide-react";

export interface MenuItem {
  icon: LucideIcon;
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

          <div className="story-hairline divide-y divide-story-ink/[0.07] overflow-hidden rounded-2xl bg-white">
            {section.items.map((item) => (
              <button
                key={item.title}
                onClick={() => handleItemClick(item)}
                className="flex w-full items-center gap-3 px-3 py-3 transition-colors hover:bg-story-cream-2"
              >
                {/* One tile treatment from the site's own palette. These were
                    saturated blue / purple / orange / yellow circles that belong
                    to no palette here and read as a stock settings template. */}
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-story-green-wash">
                  <item.icon className="h-[1.05rem] w-[1.05rem] text-story-green-dark" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-[0.9375rem] font-bold text-story-ink">{item.title}</h4>
                  <p className="text-[0.8125rem] text-story-muted">
                    {item.description}
                  </p>
                </div>
                {/* Rows that open a dialog are just as tappable as rows that
                    navigate, and previously showed no affordance at all. */}
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-story-muted-2" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
