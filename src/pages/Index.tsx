import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AddMilkTest } from "@/components/AddMilkTest";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPattern from "@/components/BackgroundPattern";
import { takePendingRating } from "@/lib/pendingRating";

// Note: This page is now protected by ProtectedRoute in App.tsx
const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // A visitor who arrived from a shelf-QR deep link had to sign in first. Pick
  // their product back up and hand it to the form the same way the product
  // picker already does, so the scan is not wasted.
  useEffect(() => {
    if (location.state?.selectedProductId) return;
    const pending = takePendingRating();
    if (!pending) return;
    navigate(location.pathname, {
      replace: true,
      state: { selectedProductId: pending.productId, selectedBrandId: pending.brandId },
    });
  }, [location.pathname, location.state, navigate]);

  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="flex items-center justify-center min-h-screen lg:pt-16 lg:pb-20 lg:px-4 pt-16 pb-24">
          <div className="w-full lg:container lg:max-w-3xl lg:mx-auto relative z-10">
            <h1 className="text-2xl font-bold mb-6 md:mb-8 text-center text-primary md:text-5xl hidden lg:block">Moo-ment of Truth</h1>
            <AddMilkTest />
          </div>
        </div>
      </BackgroundPattern>
      <MobileFooter />
    </div>
  );
};
export default Index;
