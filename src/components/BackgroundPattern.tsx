import React from "react";

interface BackgroundPatternProps {
  children: React.ReactNode;
}

const BackgroundPattern = ({ children }: BackgroundPatternProps) => {
  return (
    <div className="min-h-screen w-full max-w-full bg-gradient-to-br from-white via-emerald-50/5 to-white relative overflow-hidden">
      {/* Pure CSS Background Pattern */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Dotted pattern using CSS */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(94, 240, 230, 0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Diagonal lines pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(45deg, transparent 40%, rgba(14, 181, 181, 0.2) 50%, transparent 60%)`,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Cross-hatch pattern */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 49%, rgba(94, 240, 230, 0.3) 50%, transparent 51%),
              linear-gradient(0deg, transparent 49%, rgba(94, 240, 230, 0.2) 50%, transparent 51%)
            `,
            backgroundSize: '80px 80px'
          }}
        />
        
        {/* Circular rings using CSS */}
        <div 
          className="absolute top-1/4 left-1/4 w-32 h-32 opacity-15 rounded-full border-2 border-emerald-200/30"
          style={{
            background: `conic-gradient(from 0deg, transparent, rgba(94, 240, 230, 0.1), transparent)`
          }}
        />
        
        {/* Large decorative circle */}
        <div 
          className="absolute top-1/3 right-1/4 w-48 h-48 opacity-10 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(14, 181, 181, 0.2) 30%, transparent 70%)`
          }}
        />
        
        {/* Hexagonal pattern using CSS */}
        <div 
          className="absolute bottom-1/4 left-1/3 opacity-20"
          style={{
            width: '60px',
            height: '34.64px',
            background: 'rgba(94, 240, 230, 0.3)',
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
          }}
        />
        
        {/* Triangle pattern */}
        <div 
          className="absolute top-1/2 left-1/2 opacity-15"
          style={{
            width: '0',
            height: '0',
            borderLeft: '20px solid transparent',
            borderRight: '20px solid transparent',
            borderBottom: '35px solid rgba(14, 181, 181, 0.2)'
          }}
        />
        
        {/* Wavy pattern using CSS */}
        <div 
          className="absolute bottom-1/3 right-1/3 opacity-25"
          style={{
            width: '100px',
            height: '20px',
            background: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 10px,
              rgba(94, 240, 230, 0.3) 10px,
              rgba(94, 240, 230, 0.3) 20px
            )`,
            borderRadius: '10px'
          }}
        />
      </div>

      {/* Content */}
      {children}
    </div>
  );
};

export default BackgroundPattern;
