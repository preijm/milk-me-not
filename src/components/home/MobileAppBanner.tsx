import { Link } from "react-router-dom";
import { Smartphone, ArrowRight } from "lucide-react";

export const MobileAppBanner = () => {
  return (
    <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:pb-8">
      <div className="container max-w-3xl mx-auto">
        <Link to="/mobile-app" className="block">
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 hover:shadow-xl transition-all duration-300 hover:border-brand-primary/30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Smartphone className="h-6 w-6 flex-shrink-0 text-brand-primary" />
                <div>
                  <p className="font-semibold text-foreground">
                    Mobile App Available
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Get the best experience on Android
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
