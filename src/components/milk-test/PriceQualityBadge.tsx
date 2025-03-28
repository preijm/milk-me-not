
import React from "react";

interface PriceQualityBadgeProps {
  priceQuality?: string | null;
}

export const PriceQualityBadge: React.FC<PriceQualityBadgeProps> = ({ priceQuality }) => {
  if (!priceQuality) return <span className="text-gray-400">-</span>;

  const priceQualityMap = {
    waste_of_money: { emoji: "🚫", label: "Total waste of money" },
    not_worth_it: { emoji: "⚠️", label: "Not worth it" },
    fair_price: { emoji: "✅", label: "Fair price" },
    good_deal: { emoji: "🏆", label: "Good deal" },
    great_value: { emoji: "💎", label: "Great value for money" },
  };

  // If the price quality is not found in our map, just return a dash instead of 'unknown'
  if (!priceQualityMap[priceQuality as keyof typeof priceQualityMap]) {
    return <span className="text-gray-400">-</span>;
  }

  const { emoji, label } = priceQualityMap[priceQuality as keyof typeof priceQualityMap];

  return (
    <div className="flex items-center" title={label}>
      <span className="text-xl">{emoji}</span>
    </div>
  );
};
