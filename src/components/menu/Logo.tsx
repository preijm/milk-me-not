import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className = "" }: LogoProps) => {
  return (
    <Link to="/" className={`flex items-center gap-3 ${className}`}>
      <img 
        src="/lovable-uploads/9f030b65-074a-4e64-82d9-f0eba7246e1a.png" 
        alt="Milk Me Not Logo" 
        className="h-12 w-12 object-cover" 
        width="48" 
        height="48" 
        loading="eager" 
      />
      <span 
        className="text-gray-800 text-2xl md:text-4xl font-bold whitespace-nowrap flex items-center" 
        translate="no"
      >
        Milk Me Not
      </span>
    </Link>
  );
};
