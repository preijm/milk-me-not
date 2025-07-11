import { Link } from "react-router-dom";

const AuthFooter = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      <div className="bg-white/5 backdrop-blur-sm border-t border-white/10">
        <div className="container max-w-md mx-auto px-4 py-4">
          <div className="flex justify-center space-x-6 text-sm">
            <Link 
              to="/" 
              className="text-white/80 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="text-white/80 hover:text-white transition-colors"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-white/80 hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthFooter;