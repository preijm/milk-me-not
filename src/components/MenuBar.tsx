
import { Link } from "react-router-dom";
import { AuthButton } from "@/components/AuthButton";
import { Button } from "@/components/ui/button";

const MenuBar = () => {
  return (
    <nav className="bg-white/80 backdrop-blur-sm fixed w-full z-50 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/9f030b65-074a-4e64-82d9-f0eba7246e1a.png"
              alt="Dairy Taste Trove Logo"
              className="w-10 h-10"
            />
            <span className="text-lg font-semibold text-gray-800">Dairy Taste Trove</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
              About
            </Link>
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MenuBar;
