import React from "react";
import { Link } from "react-router-dom";
import { Milk } from "lucide-react";
import { Button } from "@/components/ui/button";
import MenuBar from "@/components/MenuBar";

const Home = () => {
  return (
    <div className="min-h-screen">
      <MenuBar />
      
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/80 via-blue-50/80 to-emerald-50/80 relative overflow-hidden">
        {/* Updated background pattern with wider SVG */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwMCIgaGVpZ2h0PSI1MDAiIHZpZXdCb3g9IjAgMCAyMDAwIDUwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNLTUwMCAyNDEuNDM3QzAtMTAwIDUwMCAwIDEwMDAgMTAwQzE1MDAgMjAwIDIwMDAgMzAwIDI1MDAgMjAwIiBzdHJva2U9InVybCgjZ3JhZGllbnQpIiBzdHJva2Utd2lkdGg9IjIiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzAwQkY2MyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzA2QjZENCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==')] opacity-40 animate-[wave_10s_ease-in-out_infinite] will-change-transform" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwMCIgaGVpZ2h0PSI1MDAiIHZpZXdCb3g9IjAgMCAyMDAwIDUwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNLTUwMCAyNDEuNDM3QzAtMTAwIDUwMCAwIDEwMDAgMTAwQzE1MDAgMjAwIDIwMDAgMzAwIDI1MDAgMjAwIiBzdHJva2U9InVybCgjZ3JhZGllbnQpIiBzdHJva2Utd2lkdGg9IjIiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzM0RDM5OSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzBFQjVCNSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==')] opacity-30 animate-[wave_15s_ease-in-out_infinite_reverse] will-change-transform scale-110" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/10 backdrop-blur-[1px] animate-pulse" />
        
        <div className="container max-w-6xl mx-auto px-4 pt-32">
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 max-w-4xl animate-fade-in" style={{ color: '#00BF63' }}>
              Ditch the Moo. <br />
              <span style={{ color: '#00BF63' }}>Find Your New!</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl animate-fade-in">
              Tired of tasteless plant milks? Rate, discover, and share your faves with a community that's just as obsessed. Whether it's for coffee, cereal, or cooking—find the dairy-free match that actually delivers.
            </p>

            <Link to="/add">
              <Button 
                size="lg" 
                className="text-lg px-8 animate-fade-in hover:bg-blue-700"
                style={{ 
                  backgroundColor: '#2144FF', 
                  color: 'white'
                }}
              >
                <Milk className="mr-2 h-6 w-6" />
                Start Your Taste Journey
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
