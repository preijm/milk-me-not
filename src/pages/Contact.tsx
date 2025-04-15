import React from "react";
import MenuBar from "@/components/MenuBar";
import { Phone, Mail, MessageSquare } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen">
      <MenuBar />
      <div className="min-h-screen pt-16 bg-gradient-to-br from-emerald-50/80 via-blue-50/80 to-emerald-50/80 relative overflow-hidden">
        {/* Updated background pattern with wider SVG */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwMCIgaGVpZ2h0PSI1MDAiIHZpZXdCb3g9IjAgMCAyMDAwIDUwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNLTUwMCAyNDEuNDM3QzAtMTAwIDUwMCAwIDEwMDAgMTAwQzE1MDAgMjAwIDIwMDAgMzAwIDI1MDAgMjAwIiBzdHJva2U9InVybCgjZ3JhZGllbnQpIiBzdHJva2Utd2lkdGg9IjIiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzAwQkY2MyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzA2QjZENCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==')] opacity-40 animate-[wave_10s_ease-in-out_infinite] will-change-transform" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwMCIgaGVpZ2h0PSI1MDAiIHZpZXdCb3g9IjAgMCAyMDAwIDUwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNLTUwMCAyNDEuNDM3QzAtMTAwIDUwMCAwIDEwMDAgMTAwQzE1MDAgMjAwIDIwMDAgMzAwIDI1MDAgMjAwIiBzdHJva2U9InVybCgjZ3JhZGllbnQpIiBzdHJva2Utd2lkdGg9IjIiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzM0RDM5OSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzBFQjVCNSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==')] opacity-30 animate-[wave_15s_ease-in-out_infinite_reverse] will-change-transform scale-110" />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />

        <div className="flex items-center justify-center min-h-screen">
          <div className="container max-w-7xl mx-auto px-4 py-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Phone className="w-8 h-8 text-emerald-600 animate-bounce" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Phone</h2>
                  <p className="text-gray-700">
                    Our phone is currently taking a well-deserved vacation in the Bermuda Triangle. It left no forwarding address.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-emerald-600 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Email</h2>
                  <p className="text-gray-700">
                    Our email server is currently meditating in a remote monastery. It's finding inner peace, please do not disturb.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-emerald-600 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Chat</h2>
                  <p className="text-gray-700">
                    Our chat bot decided to pursue its dream of becoming a stand-up comedian. We wish it the best of luck in its new career.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
