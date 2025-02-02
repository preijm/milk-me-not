import React from "react";
import { Star, Milk } from "lucide-react";
import { cn } from "@/lib/utils";

interface MilkTestResult {
  id: number;
  brand: string;
  type: string;
  rating: number;
  notes: string;
  date: string;
}

export const MilkCard = ({ result }: { result: MilkTestResult }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-fade-up hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Milk className="w-6 h-6 text-milk-400" />
          <h3 className="text-lg font-semibold text-gray-900">{result.brand}</h3>
        </div>
        <span className="text-sm text-milk-500">{result.date}</span>
      </div>
      
      <div className="mb-3">
        <span className="inline-block bg-cream-200 text-milk-500 rounded-full px-3 py-1 text-sm">
          {result.type}
        </span>
      </div>

      <div className="flex items-center mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-5 h-5",
              i < result.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            )}
          />
        ))}
      </div>

      <p className="text-milk-500">{result.notes}</p>
    </div>
  );
};