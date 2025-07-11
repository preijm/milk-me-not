import { Link } from "react-router-dom";

const MobileFooter = () => {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 shadow-lg">
        <div className="px-4 py-3">
          <div className="flex justify-center space-x-8 text-sm">
            <Link 
              to="/about" 
              className="text-gray-600 hover:text-primary transition-colors font-medium"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-600 hover:text-primary transition-colors font-medium"
            >
              Contact
            </Link>
            <Link 
              to="/results" 
              className="text-gray-600 hover:text-primary transition-colors font-medium"
            >
              Results
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileFooter;