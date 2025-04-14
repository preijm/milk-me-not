
import React from "react";
import MenuBar from "@/components/MenuBar";
import { PhoneOff, Mail, MessageCircle } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen">
      <MenuBar />
      <div className="min-h-screen pt-16 bg-gradient-to-br from-emerald-50/80 via-blue-50/80 to-emerald-50/80 flex items-center justify-center">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <PhoneOff className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Phone</h2>
                <p className="text-gray-700">
                  Our phone is currently taking a well-deserved vacation in the Bermuda Triangle.
                  It left no forwarding address.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Email</h2>
                <p className="text-gray-700">
                  Our email server is currently meditating in a remote monastery.
                  It's finding inner peace, please do not disturb.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Chat</h2>
                <p className="text-gray-700">
                  Our chat bot decided to pursue its dream of becoming a stand-up comedian.
                  We wish it the best of luck in its new career.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
