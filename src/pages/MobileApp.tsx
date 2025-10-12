import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPattern from "@/components/BackgroundPattern";
import { Smartphone, Download, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const MobileApp = () => {
  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="container max-w-4xl mx-auto px-4 pt-24 pb-20">
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Smartphone className="h-12 w-12 text-[#00bf63]" />
              <h1 className="text-3xl md:text-5xl font-bold text-[#00bf63]">
                Mobile App
              </h1>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-3 text-gray-800">
                  Get the Native Mobile Experience
                </h2>
                <p className="text-gray-600">
                  Install Milk Me Not as a native app on your Android or iOS device
                </p>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-[#00bf63] pl-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    Prerequisites
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Node.js and npm installed on your computer</li>
                    <li>Android Studio (for Android) or Xcode (for iOS on Mac)</li>
                    <li>Java Development Kit (JDK) 17 or higher (for Android)</li>
                    <li>Git installed on your computer</li>
                  </ul>
                </div>

                <div className="border-l-4 border-[#2144ff] pl-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    Installation Steps
                  </h3>
                  <ol className="list-decimal list-inside space-y-3 text-gray-700">
                    <li>
                      <strong>Export to GitHub:</strong> Click the "Export to GitHub" button in the project settings
                    </li>
                    <li>
                      <strong>Clone the repository:</strong> Run <code className="bg-gray-100 px-2 py-1 rounded">git clone [your-repo-url]</code>
                    </li>
                    <li>
                      <strong>Install dependencies:</strong> Run <code className="bg-gray-100 px-2 py-1 rounded">npm install</code>
                    </li>
                    <li>
                      <strong>Add platform:</strong> Run <code className="bg-gray-100 px-2 py-1 rounded">npx cap add android</code> or <code className="bg-gray-100 px-2 py-1 rounded">npx cap add ios</code>
                    </li>
                    <li>
                      <strong>Update dependencies:</strong> Run <code className="bg-gray-100 px-2 py-1 rounded">npx cap update android</code> or <code className="bg-gray-100 px-2 py-1 rounded">npx cap update ios</code>
                    </li>
                    <li>
                      <strong>Build the project:</strong> Run <code className="bg-gray-100 px-2 py-1 rounded">npm run build</code>
                    </li>
                    <li>
                      <strong>Sync with native platform:</strong> Run <code className="bg-gray-100 px-2 py-1 rounded">npx cap sync</code>
                    </li>
                    <li>
                      <strong>Run the app:</strong> Run <code className="bg-gray-100 px-2 py-1 rounded">npx cap run android</code> or <code className="bg-gray-100 px-2 py-1 rounded">npx cap run ios</code>
                    </li>
                  </ol>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    Important Notes
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>For iOS development, you must use a Mac with Xcode installed</li>
                    <li>Ensure your JAVA_HOME environment variable is set correctly for Android</li>
                    <li>After pulling updates from GitHub, always run <code className="bg-gray-100 px-2 py-1 rounded">npx cap sync</code></li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-gray-700">
                    <strong>Need help?</strong> For detailed instructions and troubleshooting, check out our{" "}
                    <a 
                      href="https://docs.lovable.dev/features/mobile" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#2144ff] hover:underline"
                    >
                      mobile development documentation
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BackgroundPattern>
      <MobileFooter />
    </div>
  );
};

export default MobileApp;
