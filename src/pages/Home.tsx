
import React from "react";
import { Link } from "react-router-dom";
import { Milk } from "lucide-react";
import { Button } from "@/components/ui/button";
import MenuBar from "@/components/MenuBar";

const Home = () => {
  return (
    <div className="min-h-screen">
      <MenuBar />
      
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-emerald-50 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI1MDAiIHZpZXdCb3g9IjAgMCAxNDQwIDUwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNLTM0OS42NzkgMjQxLjQzN0MtMjI5LjU1MSA5Ny4zNzYgMTA1LjY0OSAtODEuNjk5NyAzOTcuNzEgNjUuNzk5N0M2ODkuNzcxIDIxMy4yOTkgOTE2LjQ4OCA0MjguODE0IDEwNjEuMDEgNTE5LjIzQzEyMDUuNTMgNjA5LjY0NiAxNTMyLjI1IDU0My40ODQgMTY5NS42MSA0NzQuODIyIiBzdHJva2U9InVybCgjcGFpbnQwX2xpbmVhcikiIHN0cm9rZS13aWR0aD0iMiIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhciIgeDE9IjY3MyIgeTE9IjAiIHgyPSI2NzMiIHkyPSI1NzYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBzdG9wLWNvbG9yPSIjMEVCNUI1Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMzREMzk5Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9zdmc+')] 
          opacity-30 animate-[wave_8s_ease-in-out_infinite]"
        />
        
        <div className="container max-w-6xl mx-auto px-4 pt-32">
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 max-w-4xl">
              Discover Your Perfect <span className="text-emerald-600">Dairy Match</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl">
              Start your journey through the world of dairy, one taste test at a time.
            </p>

            <Link to="/add">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-lg px-8">
                <Milk className="mr-2 h-6 w-6" />
                Begin Your Dairy Adventure
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
