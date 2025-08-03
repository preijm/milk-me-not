import React from "react";
import { Circle, Star, Hexagon } from "lucide-react";

interface BackgroundPatternProps {
  children: React.ReactNode;
}

const BackgroundPattern = ({ children }: BackgroundPatternProps) => {
  return (
    <div className="h-full bg-gradient-to-br from-white via-emerald-50/5 to-white relative overflow-hidden">
      {/* CSS-based subtle background layers */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle gradient overlays contained within viewport */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(135deg, transparent 0%, rgba(94, 240, 230, 0.3) 25%, rgba(14, 181, 181, 0.2) 50%, transparent 75%)`
          }}
        />
        
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            background: `linear-gradient(45deg, transparent 0%, rgba(94, 240, 230, 0.2) 30%, rgba(14, 181, 181, 0.3) 60%, transparent 85%)`
          }}
        />
        
        {/* Contained radial accent */}
        <div 
          className="absolute top-1/3 left-1/4 w-80 h-80 opacity-10 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(94, 240, 230, 0.4) 0%, transparent 70%)`
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
