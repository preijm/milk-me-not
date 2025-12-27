import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPattern from "@/components/BackgroundPattern";
import { Heading, Text } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Download, 
  Settings, 
  ShieldCheck, 
  Package, 
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
  Smartphone
} from "lucide-react";
import { FaAndroid } from "react-icons/fa";

const InstallGuide = () => {
  const androidDownloadUrl = "https://median.co/share/nmxqdbd#apk";

  const steps = [
    {
      icon: Download,
      title: "Download the APK",
      description: "Tap the download button to get the APK file. Your browser may show a warning — this is normal for apps outside the Play Store.",
      note: "The file will be saved to your Downloads folder."
    },
    {
      icon: Settings,
      title: "Enable Unknown Sources",
      description: "Go to Settings → Security (or Privacy) → Enable 'Install unknown apps' for your browser or file manager.",
      note: "This allows installation of apps from outside the Play Store."
    },
    {
      icon: Package,
      title: "Open the APK File",
      description: "Find the downloaded APK in your Downloads folder or notification bar and tap it to start installation.",
      note: "You may need to use a file manager app."
    },
    {
      icon: ShieldCheck,
      title: "Confirm Installation",
      description: "When prompted, tap 'Install' to proceed. Android will verify the app and install it on your device.",
      note: "This may take a few seconds."
    },
    {
      icon: CheckCircle2,
      title: "Open & Enjoy!",
      description: "Once installed, tap 'Open' or find the app in your app drawer. Sign in with your account to sync your reviews.",
      note: "You're all set!"
    }
  ];

  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="pt-16 pb-20 sm:pb-8">
          <div className="container max-w-3xl mx-auto px-4 py-8 relative z-10">
            {/* Back Link */}
            <Link 
              to="/mobile-app" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Mobile App</span>
            </Link>

            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#3DDC84] mb-4">
                <FaAndroid className="w-10 h-10 text-white" />
              </div>
              <Heading level="h1" className="text-brand-primary mb-3">
                Android Installation Guide
              </Heading>
              <Text size="lg" variant="muted" className="max-w-xl mx-auto">
                Follow these simple steps to install the Milk Me Not app on your Android device.
              </Text>
            </div>

            {/* Download Button */}
            <div className="flex justify-center mb-10">
              <Button 
                asChild 
                className="bg-brand-primary hover:bg-brand-primary/90 text-white" 
                size="lg"
              >
                <a href={androidDownloadUrl} download>
                  <Download className="mr-2 h-5 w-5" />
                  Download APK
                </a>
              </Button>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => (
                <Card key={index} className="border-border">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-brand-primary/10 text-brand-primary font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <step.icon className="h-5 w-5 text-brand-primary flex-shrink-0" />
                          <Heading level="h4" className="text-foreground">
                            {step.title}
                          </Heading>
                        </div>
                        <Text variant="muted" className="mb-2">
                          {step.description}
                        </Text>
                        <Text size="sm" className="text-brand-primary">
                          {step.note}
                        </Text>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Security Notice */}
            <Card className="mt-8 border-warning/30 bg-warning/5">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <AlertTriangle className="h-6 w-6 text-warning flex-shrink-0" />
                  <div>
                    <Heading level="h5" className="text-foreground mb-2">
                      Is this safe?
                    </Heading>
                    <Text size="sm" variant="muted">
                      Yes! Our APK is the same app we publish — just distributed directly to you. 
                      Android shows warnings for any app installed outside the Play Store, but this 
                      is standard practice. We recommend only downloading from our official website.
                    </Text>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* iPhone Notice */}
            <Card className="mt-4 border-border bg-muted/30">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Smartphone className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                  <div>
                    <Heading level="h5" className="text-foreground mb-2">
                      Using an iPhone?
                    </Heading>
                    <Text size="sm" variant="muted">
                      An iOS app isn't available yet, but our website works great on mobile! 
                      Just visit milkmenot.com in Safari and use it like an app. You can even 
                      add it to your home screen for quick access.
                    </Text>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <div className="text-center mt-10">
              <Text variant="muted" className="mb-4">
                Still having trouble? We're here to help.
              </Text>
              <Button asChild variant="outline" className="border-brand-primary text-brand-primary hover:bg-brand-primary/5">
                <Link to="/contact">
                  Contact Support
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </BackgroundPattern>
      <MobileFooter />
    </div>
  );
};

export default InstallGuide;
