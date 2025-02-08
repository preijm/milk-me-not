
import React from "react";
import { Milk } from "lucide-react";
import { cn } from "@/lib/utils";

interface MilkTestResult {
  id: string;
  brand: string;
  type: string;
  rating: number;
  notes: string | null;
  created_at: string;
  username?: string | null;
}

interface MilkCardProps {
  result: MilkTestResult;
  showUsername?: boolean;
}

export const MilkCard = ({ result, showUsername = false }: MilkCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-fade-up hover:shadow-lg transition-shadow relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Milk className="w-6 h-6 text-milk-400" />
          <h3 className="text-lg font-semibold text-gray-900">{result.brand}</h3>
        </div>
        <span className="text-sm text-milk-500">
          {new Date(result.created_at).toLocaleDateString()}
        </span>
      </div>
      
      <div className="mb-3">
        <span className="inline-block bg-cream-200 text-milk-500 rounded-full px-3 py-1 text-sm">
          {result.type}
        </span>
        {showUsername && result.username && (
          <span className="inline-block bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm ml-2">
            {result.username}
          </span>
        )}
      </div>

      <div className="flex items-center mb-3">
        <div className="bg-cream-300 rounded-full h-12 w-12 flex items-center justify-center">
          <span className="font-semibold text-milk-500">{Number(result.rating).toFixed(1)}</span>
        </div>
      </div>

      <p className="text-milk-500">{result.notes}</p>
    </div>
  );
};
