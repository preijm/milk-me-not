import { Link } from "react-router-dom";
import { AuthButton } from "@/components/AuthButton";
const MenuBar = () => {
  return <nav className="bg-white/5 backdrop-blur-[2px] fixed w-full z-50 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img src="/lovable-uploads/9f030b65-074a-4e64-82d9-f0eba7246e1a.png" alt="Milk Me Not Logo" className="h-12 w-12" />
            <span className="text-gray-800 text-4xl font-bold">Milk Me Not</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/results" className="text-gray-700 hover:text-gray-900 transition-colors">
              Results
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-gray-900 transition-colors">
              About
            </Link>
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>;
};
export default MenuBar;