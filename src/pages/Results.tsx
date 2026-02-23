import React, { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAggregatedResults } from "@/hooks/useAggregatedResults";
import { useResultsUrlState, useResultsFiltering } from "@/hooks/useResultsState";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import MenuBar from "@/components/MenuBar";
import BackgroundPattern from "@/components/BackgroundPattern";
import MobileFooter from "@/components/MobileFooter";
import { ResultsContainer } from "@/components/milk-test/ResultsContainer";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { ResultsViewSwitcher } from "@/components/results/ResultsViewSwitcher";
import { MapLoginOverlay } from "@/components/results/MapLoginOverlay";
import { ChartComingSoon } from "@/components/results/ChartComingSoon";
import { Loader } from "lucide-react";

// Lazy-load heavy map component (~200KB+ mapbox-gl) - only needed when user clicks "map" view
const MapboxWorldMap = lazy(() => import("@/components/MapboxWorldMap"));

const Results = () => {
  const {
    searchTerm,
    setSearchTerm,
    sortConfig,
    filters,
    setFilters,
    handleSort,
    handleSetSort,
    handleClearSort,
  } = useResultsUrlState();

  const [view, setView] = useState<"table" | "charts" | "map">("table");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState("");

  const { data: aggregatedResults = [], isLoading } =
    useAggregatedResults(sortConfig);
  const { filteredResults } = useResultsFiltering(
    aggregatedResults,
    searchTerm,
    filters
  );

  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const navigateToProduct = async (productId: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const product = aggregatedResults.find((r) => r.product_id === productId);
      const productDisplayName = product
        ? `${product.brand_name} ${product.product_name}`
        : "";

      setSelectedProductName(productDisplayName);
      setShowLoginPrompt(true);
      return;
    }

    navigate(`/product/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <MenuBar />
        <BackgroundPattern>
          <div className="container max-w-5xl mx-auto px-4 py-8 pt-24">
            <div className="text-center mt-8">
              <div className="text-xl text-muted-foreground">Loading...</div>
            </div>
          </div>
        </BackgroundPattern>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-24 pb-20 sm:pb-8 relative z-10">
          {/* Desktop only: View switcher */}
          {!isMobile && (
            <ResultsViewSwitcher view={view} onViewChange={setView} />
          )}

          {/* Mobile: Always table view, Desktop: conditional view */}
          {isMobile || view === "table" ? (
            <ResultsContainer
              filteredResults={filteredResults}
              sortConfig={sortConfig}
              handleSort={handleSort}
              onSetSort={handleSetSort}
              onClearSort={handleClearSort}
              onProductClick={navigateToProduct}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filters={filters}
              onFiltersChange={setFilters}
            />
          ) : view === "charts" ? (
            <ChartComingSoon />
          ) : user ? (
            <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader className="h-8 w-8 animate-spin text-primary" /></div>}>
              <MapboxWorldMap />
            </Suspense>
          ) : (
            <MapLoginOverlay />
          )}
        </div>
      </BackgroundPattern>

      <MobileFooter />

      {/* Login prompt modal */}
      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        productName={selectedProductName}
      />
    </div>
  );
};

export default Results;
