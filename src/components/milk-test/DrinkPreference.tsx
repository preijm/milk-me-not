import React from "react";
import { IceCream, Flame, Coffee } from "lucide-react";

interface DrinkPreferenceProps {
  preference: string;
  setPreference: (pref: string) => void;
}

export const DrinkPreference = ({ preference, setPreference }: DrinkPreferenceProps) => {
  return (
    <div className="flex gap-4">
      <button
        type="button"
        onClick={() => setPreference("cold")}
        className={`flex flex-col items-center p-3 rounded-lg transition-all w-24 ${
          preference === "cold"
            ? "bg-soft-blue text-blue-600"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        <IceCream className="w-8 h-8 mb-1" />
        <span className="text-sm">Cold</span>
      </button>
      <button
        type="button"
        onClick={() => setPreference("hot")}
        className={`flex flex-col items-center p-3 rounded-lg transition-all w-24 ${
          preference === "hot"
            ? "bg-soft-peach text-orange-600"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        <Flame className="w-8 h-8 mb-1" />
        <span className="text-sm">Hot</span>
      </button>
      <button
        type="button"
        onClick={() => setPreference("coffee")}
        className={`flex flex-col items-center p-3 rounded-lg transition-all w-24 ${
          preference === "coffee"
            ? "bg-soft-brown text-amber-800"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        <Coffee className="w-8 h-8 mb-1" />
        <span className="text-sm">Coffee</span>
      </button>
      <button
        type="button"
        onClick={() => setPreference("tea")}
        className={`flex flex-col items-center p-3 rounded-lg transition-all w-24 ${
          preference === "tea"
            ? "bg-soft-gray text-gray-900"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        <Coffee className="w-8 h-8 mb-1 rotate-[15deg]" />
        <span className="text-sm">Tea</span>
      </button>
    </div>
  );
};
