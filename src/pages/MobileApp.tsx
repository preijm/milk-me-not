import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPatternWithOverlay from "@/components/BackgroundPatternWithOverlay";
import { Download, ExternalLink } from "lucide-react";
import { FaAndroid, FaApple } from "react-icons/fa";
import { Button } from "@/components/ui/button";

const MobileApp = () => {
  // Placeholder URLs - to be updated later
  const androidDownloadUrl = "https://median.co/share/nmxqdbd#apk";
  const iosDownloadUrl = "#";
  const androidStoreUrl = "#";
  const iosStoreUrl = "#";

  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPatternWithOverlay>
        <div className="flex items-center justify-center min-h-screen pt-16 pb-20 sm:pb-8">
          <div className="container max-w-5xl mx-auto px-4 py-8 relative z-10">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-[#00bf63] mb-4">
                Get the Mobile App
              </h1>
              <p className="text-lg text-gray-700">Love what you see? You'll love it even more in the app.</p>
            </div>

            {/* Platform Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Android Tile */}
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-20 w-20 rounded-full flex items-center justify-center bg-[#3DDC84]">
                    <FaAndroid className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800">Android</h2>
                  <p className="text-gray-700 mb-4">
                    Get the full native experience on your Android device.
                  </p>
                  
                  <div className="w-full space-y-3">
                    <Button 
                      asChild 
                      className="w-full bg-[#00bf63] hover:bg-[#00bf63]/90 text-white" 
                      size="lg"
                    >
                      <a href={androidDownloadUrl} download>
                        <Download className="mr-2 h-5 w-5" />
                        Download APK
                      </a>
                    </Button>
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full border-2 border-[#00bf63] text-[#00bf63] hover:bg-[#00bf63]/5 hover:text-[#00bf63]" 
                      size="lg"
                    >
                      <a href={androidStoreUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-5 w-5" />
                        Google Play Store
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* iOS Tile */}
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-20 w-20 rounded-full flex items-center justify-center bg-[#000000]">
                    <FaApple className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800">iOS</h2>
                  <p className="text-gray-700 mb-4">
                    Experience Milk Me Not on your iPhone or iPad.
                  </p>
                  
                  <div className="w-full space-y-3">
                    <Button 
                      asChild 
                      className="w-full bg-[#00bf63] hover:bg-[#00bf63]/90 text-white" 
                      size="lg"
                    >
                      <a href={iosDownloadUrl} download>
                        <Download className="mr-2 h-5 w-5" />
                        Download iOS App
                      </a>
                    </Button>
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full border-2 border-[#00bf63] text-[#00bf63] hover:bg-[#00bf63]/5 hover:text-[#00bf63]" 
                      size="lg"
                    >
                      <a href={iosStoreUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-5 w-5" />
                        Apple App Store
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 text-center mt-8">
              Need help? Check our{" "}
              <a 
                href="https://docs.lovable.dev/features/mobile" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#2144ff] hover:underline"
              >
                installation guide
              </a>
            </p>
          </div>
        </div>
      </BackgroundPatternWithOverlay>
      <MobileFooter />
    </div>
  );
};

export default MobileApp;
