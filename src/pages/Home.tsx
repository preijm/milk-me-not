import { useNavigate } from "react-router-dom";
import MenuBar from "@/components/MenuBar";
import BackgroundPattern from "@/components/BackgroundPattern";
import MobileFooter from "@/components/MobileFooter";
import { supabase } from "@/integrations/supabase/client";
import { isNativeApp } from "@/lib/platformDetection";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustIndicators } from "@/components/home/TrustIndicators";
import { MobileAppBanner } from "@/components/home/MobileAppBanner";
import { useHomeStats, formatNumber } from "@/components/home/useHomeStats";

const Home = () => {
  const navigate = useNavigate();
  const isNative = isNativeApp();
  const stats = useHomeStats();

  const handleStartJourney = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth", {
        state: { from: "/add" },
      });
    } else {
      navigate("/add");
    }
  };

  const trustIndicatorItems = [
    {
      value: stats.totalTests,
      label: "Reviews",
      colorClass: "bg-brand-primary",
    },
    {
      value: stats.brandsCovered,
      label: "Brands",
      colorClass: "bg-brand-secondary",
      delayClass: "delay-300",
    },
    {
      value: stats.activeMembers,
      label: "Members",
      colorClass: "bg-primary",
      delayClass: "delay-500",
    },
  ];

  return (
    <div className="min-h-dvh overflow-hidden flex flex-col">
      <MenuBar />

      <BackgroundPattern>
        <div className="flex-1 flex flex-col min-h-[calc(100dvh-64px)]">
          {/* Hero content - centered */}
          <div className="container max-w-4xl mx-auto px-4 pt-8 lg:pt-16 flex items-center justify-center flex-1">
            <div className="flex flex-col items-center">
              <HeroSection onStartJourney={handleStartJourney} />
              <TrustIndicators
                items={trustIndicatorItems}
                formatNumber={formatNumber}
              />
            </div>
          </div>

          {/* Mobile App Banner - centered in remaining space */}
          {!isNative && <MobileAppBanner />}
        </div>
      </BackgroundPattern>

      <MobileFooter />
    </div>
  );
};

export default Home;
