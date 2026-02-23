import { Link } from "react-router-dom";
import logoImg from "@/assets/logo-96.png";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className = "" }: LogoProps) => {
  return (
    <Link to="/" className={`flex items-center gap-3 ${className}`}>
      <img 
        src={logoImg} 
        alt="Milk Me Not Logo"
        className="h-12 w-12 object-cover" 
        width="48" 
        height="48" 
        loading="eager"
        fetchPriority="high"
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
