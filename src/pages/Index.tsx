import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AddMilkTest } from "@/components/AddMilkTest";
import { StoryAppLayout } from "@/components/story/StoryAppLayout";
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

  const isEditMode = !!location.state?.editTest;

  return (
    <StoryAppLayout
      title={isEditMode ? "Change your mind?" : "Moo-ment of truth"}
      lede={
        isEditMode
          ? "Update what you said about this carton."
          : "One carton, one honest score. Takes about a minute."
      }
    >
      <AddMilkTest />
    </StoryAppLayout>
  );
};
export default Index;
