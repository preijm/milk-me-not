import React from "react";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import { User, Settings, Shield } from "lucide-react";
import BackgroundPattern from "@/components/BackgroundPattern";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();

  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="flex items-center justify-center min-h-screen pt-16 pb-20 sm:pb-8">
          <div className="container max-w-4xl mx-auto px-4 py-4 sm:py-8 relative z-10">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#00bf63' }}>
                  <User className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-800">Profile</h1>
              </div>

              {/* User Info */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-900 font-medium">{user?.email}</p>
                  </div>
                  {profile?.username && (
                    <div>
                      <p className="text-sm text-gray-600">Username</p>
                      <p className="text-gray-900 font-medium">{profile.username}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Settings</h2>
                
                <Link 
                  to="/account"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900 font-medium">Account Settings</span>
                  </div>
                </Link>

                <Link 
                  to="/account/security"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900 font-medium">Security</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </BackgroundPattern>
      <MobileFooter />
    </div>
  );
};

export default Profile;
