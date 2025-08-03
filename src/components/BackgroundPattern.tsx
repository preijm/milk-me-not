import React from "react";
import { Circle, Star, Hexagon } from "lucide-react";

interface BackgroundPatternProps {
  children: React.ReactNode;
}

const BackgroundPattern = ({ children }: BackgroundPatternProps) => {
  return (
    <div className="h-full bg-gradient-to-br from-white via-emerald-50/5 to-white relative overflow-hidden">
      {/* CSS-based curved backgrounds */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary flowing gradient */}
        <div 
          className="absolute -top-10 -left-20 w-[120%] h-[120%] opacity-20"
          style={{
            background: `linear-gradient(135deg, transparent 0%, rgba(94, 240, 230, 0.3) 25%, rgba(14, 181, 181, 0.2) 50%, transparent 75%)`,
            transform: 'rotate(-15deg) skewY(5deg)',
            borderRadius: '50% 20% 30% 40%'
          }}
        />
        
        {/* Secondary flowing gradient */}
        <div 
          className="absolute -bottom-10 -right-20 w-[100%] h-[100%] opacity-15"
          style={{
            background: `linear-gradient(45deg, transparent 0%, rgba(94, 240, 230, 0.2) 30%, rgba(14, 181, 181, 0.3) 60%, transparent 85%)`,
            transform: 'rotate(25deg) skewX(-5deg)',
            borderRadius: '30% 50% 20% 40%'
          }}
        />
        
        {/* Subtle radial accent */}
        <div 
          className="absolute top-1/3 left-1/4 w-96 h-96 opacity-10"
          style={{
            background: `radial-gradient(circle, rgba(94, 240, 230, 0.4) 0%, transparent 70%)`,
            transform: 'scale(1.5)'
          }}
        />
      </div>

      {/* Subtle geometric patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-left circle */}
        <div className="absolute -left-4 top-20 text-emerald-100/20">
          <Circle size={80} />
        </div>
        
        {/* Bottom-right circle */}
        <div className="absolute right-12 bottom-32 text-emerald-100/10">
          <Circle size={120} />
        </div>

        {/* Center-right star */}
        <div className="absolute right-1/4 top-1/3 text-teal-100/20">
          <Star size={40} />
        </div>

        {/* Bottom-left hexagon */}
        <div className="absolute left-1/4 bottom-1/4 text-emerald-100/15">
          <Hexagon size={60} />
        </div>

        {/* Small scattered circles */}
        <div className="absolute left-1/3 top-1/4 text-teal-100/10">
          <Circle size={20} />
        </div>
        <div className="absolute right-1/3 bottom-1/3 text-emerald-100/15">
          <Circle size={30} />
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
};

export default BackgroundPattern;
