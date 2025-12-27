import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPattern from "@/components/BackgroundPattern";
import { Download, ExternalLink, Smartphone } from "lucide-react";
import { FaAndroid } from "react-icons/fa";
import { Button } from "@/components/ui/button";

const MobileApp = () => {
  const androidDownloadUrl = "https://median.co/share/nmxqdbd#apk";
  const androidStoreUrl = "#";

  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="flex items-center justify-center min-h-screen pt-16 pb-20 sm:pb-8">
          <div className="container max-w-3xl mx-auto px-4 py-8 relative z-10">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-brand-primary mb-4">
                Get the Mobile App
              </h1>
              <p className="text-lg text-muted-foreground">
                Take your plant milk reviews on the go with our Android app.
              </p>
            </div>

            {/* Android Tile - Centered */}
            <div className="max-w-md mx-auto">
              <div className="bg-card rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow border border-border">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-20 w-20 rounded-full flex items-center justify-center bg-[#3DDC84]">
                    <FaAndroid className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground">Android</h2>
                  <p className="text-muted-foreground mb-4">
                    Get the full native experience on your Android device.
                  </p>
                  
                  <div className="w-full space-y-3">
                    <Button 
                      asChild 
                      className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white" 
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
                      className="w-full border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/5" 
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
            </div>

            {/* iOS Notice */}
            <div className="mt-8 p-6 bg-muted/50 rounded-lg border border-border max-w-md mx-auto">
              <div className="flex items-start gap-4">
                <Smartphone className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground mb-1">iPhone users</h3>
                  <p className="text-sm text-muted-foreground">
                    An iOS app is not available yet. In the meantime, you can use our website on your iPhone browser — it works great on mobile!
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center mt-8">
              Need help? Check our{" "}
              <a 
                href="https://docs.lovable.dev/features/mobile" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-brand-secondary hover:underline"
              >
                installation guide
              </a>
            </p>
          </div>
        </div>
      </BackgroundPattern>
      <MobileFooter />
    </div>
  );
};

export default MobileApp;
