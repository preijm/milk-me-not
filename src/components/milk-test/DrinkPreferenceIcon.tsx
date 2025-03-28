
import React from "react";
import { CoffeeIcon, Milk, TeaCup } from "../icons/DrinkIcons";
import { ColdIcon, HotIcon } from "../icons/TemperatureIcons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DrinkPreferenceIconProps {
  preference: string | null | undefined;
  className?: string;
}

export const DrinkPreferenceIcon = ({ preference, className = "w-6 h-6" }: DrinkPreferenceIconProps) => {
  if (!preference) return null;
  
  const preferenceMap = {
    cold: { icon: <ColdIcon className={className} />, label: "Cold" },
    hot: { icon: <HotIcon className={className} />, label: "Hot" },
    coffee: { icon: <CoffeeIcon className={className} />, label: "Coffee" },
    tea: { icon: <TeaCup className={className} />, label: "Tea" },
    milk: { icon: <Milk className={className} />, label: "Milk" },
  };
  
  const preferenceKey = preference.toLowerCase() as keyof typeof preferenceMap;
  const { icon, label } = preferenceMap[preferenceKey] || { 
    icon: <Milk className={className} />, 
    label: "Milk" 
  };
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            {icon}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
