import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface BackgroundPatternProps {
  children: React.ReactNode;
}

const BackgroundPattern = ({ children }: BackgroundPatternProps) => {
  const { scrollY } = useScroll();
  
  // Create parallax transforms with different speeds for depth
  const oatPatternY = useTransform(scrollY, [0, 1000], [0, 150]);
  const milkSplashY = useTransform(scrollY, [0, 1000], [0, -100]);

  return (
    <div 
      className="min-h-screen w-full max-w-full relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #ffffff, #ffffff, rgba(0, 191, 99, 0.02), rgba(33, 68, 255, 0.015), #ffffff, #ffffff)'
      }}
    >
      {/* Oat grains pattern with parallax */}
      <motion.div 
        style={{
          position: 'absolute',
          inset: '0',
          backgroundImage: `
            radial-gradient(ellipse 3px 6px at 20% 30%, rgba(0, 191, 99, 0.2) 70%, transparent 71%),
            radial-gradient(ellipse 2px 5px at 60% 70%, rgba(0, 191, 99, 0.15) 70%, transparent 71%),
            radial-gradient(ellipse 4px 7px at 80% 20%, rgba(0, 191, 99, 0.18) 70%, transparent 71%)
          `,
          backgroundSize: '180px 180px, 140px 140px, 220px 220px',
          opacity: 0.4,
          y: oatPatternY
        }}
      />
      
      {/* Milk splash with animation and parallax */}
      <motion.div 
        style={{
          position: 'absolute',
          top: '40%',
          right: '30%',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(33, 68, 255, 0.1), transparent 70%)',
          opacity: 0.5,
          animation: 'gentlePulse 4s ease-in-out infinite',
          y: milkSplashY
        }}
      />

      {/* Content */}
      {children}

      {/* Keyframes for animation */}
      <style>
        {`
          @keyframes gentlePulse {
            0%, 100% { 
              transform: scale(1); 
              opacity: 0.9; 
            }
            50% { 
              transform: scale(1.1); 
              opacity: 0.6; 
            }
          }
        `}
      </style>
    </div>
  );
};

export default BackgroundPattern;
