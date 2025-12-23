
import React from "react";
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

// Custom Cold icon component
const ColdIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24"
    className={className}
  >
    <path 
      fill="none" 
      stroke="currentColor" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="1.5" 
      d="m7.5 12l.827 2.696C9.82 19.566 10.567 22 12 22s2.18-2.435 3.673-7.304L16.5 12M12 8.667a3.2 3.2 0 0 0 .453 1.641m0 0C11.717 11.33 10.483 12 9.083 12C6.828 12 5 10.259 5 8.111C5 6.228 6.406 4.657 8.272 4.3C8.911 2.944 10.34 2 12 2c2.072 0 3.783 1.47 4.048 3.374m-3.595 4.934C13.054 11.318 14.193 12 15.5 12c1.933 0 3.5-1.492 3.5-3.333c0-1.664-1.28-3.043-2.952-3.293m-.358 2.182a3.7 3.7 0 0 0 .358-2.182" 
      color="currentColor"
    />
  </svg>
);

// Custom Hot icon component
const HotIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24"
    className={className}
  >
    <path 
      fill="none" 
      stroke="currentColor" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="1.5" 
      d="M13.856 22c12.222-3 5.378-15-2.933-20c-.978 3.5-2.445 4.5-5.378 8c-3.884 4.634-1.955 10 3.422 12c-.815-1-2.917-3.1-1.467-6c.5-1 1.5-2 1-4c.978.5 3 1 3.5 3.5c.815-1 1.66-3.1.878-5.5c6.122 4.5 3.622 9 .978 12" 
      color="currentColor"
    />
  </svg>
);

export const DrinkPreference = ({ preference, setPreference }: DrinkPreferenceProps) => {
  const isMobile = useIsMobile();

  const buttons = [
    {
      value: "cold",
      icon: ColdIcon,
      label: "Cold",
      activeClass: "bg-white text-score-good border-score-good",
    },
    {
      value: "hot",
      icon: HotIcon,
      label: "Hot",
      activeClass: "bg-white text-score-poor border-score-poor",
    },
    {
      value: "coffee",
      icon: CoffeeIcon,
      label: "Coffee",
      activeClass: "bg-white text-amber-800 border-amber-800",
    },
    {
      value: "tea",
      icon: TeaCup,
      label: "Tea",
      activeClass: "bg-white text-score-fair border-score-fair",
    },
  ];

  return (
    <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
      {buttons.map(({ value, icon: Icon, label, activeClass }) => (
        <button
          key={value}
          type="button"
          onClick={() => setPreference(value)}
          className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
            preference === value
              ? `${activeClass} shadow-sm`
              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          <Icon className="w-8 h-8 mb-1" />
          <span className="text-sm">{label}</span>
        </button>
      ))}
    </div>
  );
};
