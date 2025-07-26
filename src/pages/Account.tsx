
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import { ProfileSection } from "@/components/account/ProfileSection";
import { SecuritySection } from "@/components/account/SecuritySection";

const Account = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <MenuBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-green-500 mb-2">Account Settings</h1>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-8 space-y-8">
            <ProfileSection />
            <div className="border-t pt-8">
              <SecuritySection />
            </div>
          </div>
        </div>
      </div>
      
      <MobileFooter />
    </div>
  );
};

export default Account;

