
import { Link, useLocation } from "react-router-dom";
import { AuthButton } from "@/components/AuthButton";

const MenuBar = () => {
  const location = useLocation();

  return (
    <nav className="bg-white/5 backdrop-blur-[2px] fixed w-full z-50 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 my-[5px]">
          <Link to="/" className="flex items-center gap-3">
            <img src="/lovable-uploads/9f030b65-074a-4e64-82d9-f0eba7246e1a.png" alt="Milk Me Not Logo" className="h-12 w-12" />
            <span className="text-gray-800 text-2xl md:text-4xl font-bold whitespace-nowrap flex items-center" translate="no">Milk Me Not</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className={`transition-colors ${location.pathname === '/' ? 'text-[#00bf63] font-medium' : 'text-gray-700 hover:text-gray-900'}`}>
                Home
              </Link>
              <Link to="/feed" className={`transition-colors ${location.pathname === '/feed' ? 'text-[#00bf63] font-medium' : 'text-gray-700 hover:text-gray-900'}`}>
                Feed
              </Link>
              <Link to="/results" className={`transition-colors ${location.pathname === '/results' ? 'text-[#00bf63] font-medium' : 'text-gray-700 hover:text-gray-900'}`}>
                Results
              </Link>
              <Link to="/about" className={`transition-colors ${location.pathname === '/about' ? 'text-[#00bf63] font-medium' : 'text-gray-700 hover:text-gray-900'}`}>
                About
              </Link>
              <Link to="/contact" className={`transition-colors ${location.pathname === '/contact' ? 'text-[#00bf63] font-medium' : 'text-gray-700 hover:text-gray-900'}`}>
                Contact
              </Link>
              <Link to="/mobile-app" className={`transition-colors ${location.pathname === '/mobile-app' ? 'text-[#00bf63] font-medium' : 'text-gray-700 hover:text-gray-900'}`}>
                Mobile App
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
