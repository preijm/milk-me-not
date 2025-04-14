
import React from "react";
import MenuBar from "@/components/MenuBar";
import { Card } from "@/components/ui/card";
import { Mail, MessageCircle, PhoneOff } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen">
      <MenuBar />
      <div className="min-h-screen pt-16 bg-gradient-to-br from-emerald-50/80 via-blue-50/80 to-emerald-50/80">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Don't Contact Us</h1>
            
            <div className="space-y-8">
              <section className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                <PhoneOff className="w-8 h-8 text-emerald-600" />
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">Phone</h2>
                  <p className="text-gray-700">
                    Our phone is currently taking a well-deserved vacation in the Bermuda Triangle.
                    It left no forwarding address.
                  </p>
                </div>
              </section>
              
              <section className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                <Mail className="w-8 h-8 text-emerald-600" />
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">Email</h2>
                  <p className="text-gray-700">
                    Our email server is currently meditating in a remote monastery.
                    It's finding inner peace, please do not disturb.
                  </p>
                </div>
              </section>
              
              <section className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                <MessageCircle className="w-8 h-8 text-emerald-600" />
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">Chat</h2>
                  <p className="text-gray-700">
                    Our chat bot decided to pursue its dream of becoming a stand-up comedian.
                    We wish it the best of luck in its new career.
                  </p>
                </div>
              </section>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
