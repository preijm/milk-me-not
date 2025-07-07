
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddMilkTest } from "@/components/AddMilkTest";
import { supabase } from "@/integrations/supabase/client";
import MenuBar from "@/components/MenuBar";
import BackgroundPattern from "@/components/BackgroundPattern";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession();
        
        if (!session) {
          // Redirect to auth page if not logged in
          navigate("/auth");
        } else {
          // Only set loading to false if we're authenticated
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        // On error, redirect to auth page as a fallback
        navigate("/auth");
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Don't render content until authentication check is complete
  if (isLoading) {
    return null; // Return nothing while checking auth
  }

  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="container max-w-6xl mx-auto px-4 py-8 pt-32 relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Milk Test</h1>
          <AddMilkTest />
        </div>
      </BackgroundPattern>
    </div>
  );
};

export default Index;
