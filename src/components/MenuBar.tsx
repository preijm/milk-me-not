
import { Link, useLocation } from "react-router-dom";
import { AuthButton } from "@/components/AuthButton";

const MenuBar = () => {
  const location = useLocation();

  return (
    <nav className="bg-white/5 backdrop-blur-[2px] fixed w-full z-50 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 my-[5px]">
          <Link to="/" className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <img src="/lovable-uploads/9f030b65-074a-4e64-82d9-f0eba7246e1a.png" alt="Milk Me Not Logo" className="h-10 md:h-12 w-10 md:w-12 flex-shrink-0" />
            <span className="text-gray-800 text-lg md:text-4xl font-bold whitespace-nowrap">Milk Me Not</span>
          </Link>
          
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {/* Navigation Menu - responsive */}
            <div className="hidden sm:flex items-center gap-3 md:gap-6">
              <Link to="/results" className={`transition-colors text-sm md:text-base ${location.pathname === '/results' ? 'text-[#00bf63] font-medium' : 'text-gray-700 hover:text-gray-900'}`}>
                Results
              </Link>
              <Link to="/about" className={`transition-colors text-sm md:text-base ${location.pathname === '/about' ? 'text-[#00bf63] font-medium' : 'text-gray-700 hover:text-gray-900'}`}>
                About
              </Link>
              <Link to="/contact" className={`transition-colors text-sm md:text-base ${location.pathname === '/contact' ? 'text-[#00bf63] font-medium' : 'text-gray-700 hover:text-gray-900'}`}>
                Contact
              </Link>
            </div>

            {/* AuthButton for all screen sizes */}
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MenuBar;
