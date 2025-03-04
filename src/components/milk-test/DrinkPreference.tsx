
import React from "react";
import { IceCream, Flame } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DrinkPreferenceProps {
  preference: string;
  setPreference: (pref: string) => void;
}

// Custom TeaCup SVG icon component
const TeaCup = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24"
    className={className}
  >
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="currentColor">
      <path d="M18.25 10.5h1.39c1.852 0 2.402.265 2.357 1.584c-.073 2.183-1.058 4.72-4.997 5.416"/>
      <path d="M5.946 20.615C2.572 18.02 2.075 14.34 2.001 10.5c-.031-1.659.45-2 2.658-2h10.682c2.208 0 2.69.341 2.658 2c-.074 3.84-.57 7.52-3.945 10.115c-.96.738-1.77.885-3.135.885H9.081c-1.364 0-2.174-.147-3.135-.886"/>
      <path d="M10 8.5v5m-1.496 2.797l.292-1.852c.086-.542.598-.945 1.203-.945c.604 0 1.117.403 1.202.945l.292 1.852c.158.997-3.127.876-2.989 0M11.309 2.5C10.762 2.839 10 4 10 5.5M7.54 4S7 4.5 7 5.5M14.001 4c-.273.17-.501 1-.501 1.5"/>
    </g>
  </svg>
);

// Custom Coffee SVG icon component
const CoffeeIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24"
    className={className}
  >
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="currentColor">
      <path d="M18.25 10.5h1.39c1.852 0 2.402.265 2.357 1.584c-.073 2.183-1.058 4.72-4.997 5.416"/>
      <path d="M5.946 20.615C2.572 18.02 2.075 14.34 2.001 10.5c-.031-1.659.45-2 2.658-2h10.682c2.208 0 2.69.341 2.658 2c-.074 3.84-.57 7.52-3.945 10.115c-.96.738-1.77.885-3.135.885H9.081c-1.364 0-2.174-.147-3.135-.886M11.309 2.5C10.762 2.839 10 4 10 5.5M7.54 4S7 4.5 7 5.5M14.001 4c-.273.17-.501 1-.501 1.5"/>
    </g>
  </svg>
);

export const DrinkPreference = ({ preference, setPreference }: DrinkPreferenceProps) => {
  const isMobile = useIsMobile();

  const buttons = [
    {
      value: "cold",
      icon: IceCream,
      label: "Cold",
      activeClass: "bg-soft-blue text-blue-600",
    },
    {
      value: "hot",
      icon: Flame,
      label: "Hot",
      activeClass: "bg-soft-peach text-orange-600",
    },
    {
      value: "coffee",
      icon: CoffeeIcon,
      label: "Coffee",
      activeClass: "bg-soft-brown text-amber-800",
    },
    {
      value: "tea",
      icon: TeaCup,
      label: "Tea",
      activeClass: "bg-soft-gray text-gray-900",
    },
  ];

  return (
    <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
      {buttons.map(({ value, icon: Icon, label, activeClass }) => (
        <button
          key={value}
          type="button"
          onClick={() => setPreference(value)}
          className={`flex flex-col items-center p-3 rounded-lg transition-all ${
            preference === value
              ? activeClass
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Icon className="w-8 h-8 mb-1" />
          <span className="text-sm">{label}</span>
        </button>
      ))}
    </div>
  );
};
