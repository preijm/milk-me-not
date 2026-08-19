import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { Loader } from "lucide-react";
import { Seo } from "@/components/Seo";
import { useNavigate } from "react-router-dom";
import { useAggregatedResults } from "@/hooks/useAggregatedResults";
import { useResultsUrlState, useResultsFiltering } from "@/hooks/useResultsState";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { Band, SectionHead, StoryButton, StoryLayout } from "@/components/story";
import { ResultsViewSwitcher } from "@/components/results/ResultsViewSwitcher";
import { ResultsCharts } from "@/components/results/ResultsCharts";
import { ResultsHero } from "@/components/results/ResultsHero";
import { ResultsToolbarDesktop, ResultsToolbarMobile } from "@/components/results/ResultsToolbar";
import { ResultsRankedList } from "@/components/results/ResultsRankedList";
import { ResultsCardList } from "@/components/results/ResultsCardList";
import { ResultsEmptyState } from "@/components/results/ResultsEmptyState";
import { ResultsSkeleton } from "@/components/results/ResultsSkeleton";
import { computeCatalogueStats } from "@/components/results/resultsStats";

// Lazy-load heavy map component (~200KB+ mapbox-gl) - only needed when user clicks "map" view
const MapboxWorldMap = lazy(() => import("@/components/MapboxWorldMap"));

/** Rows revealed per batch. */
const PAGE_SIZE = 40;

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

  const { data: aggregatedResults = [], isLoading } = useAggregatedResults(sortConfig);
  const { filteredResults } = useResultsFiltering(aggregatedResults, searchTerm, filters);

  // 220 rows at once makes a 23,000px page nobody reaches the bottom of, so the
  // list arrives a screenful at a time. Any change to the query starts over.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, filters, sortConfig]);
  const visibleResults = filteredResults.slice(0, visibleCount);
  const remaining = filteredResults.length - visibleResults.length;

  // The charts read raw ratings, but must show the same slice as the ranking —
  // so they follow the products that survived filtering rather than filtering
  // twice against two different grains.
  const visibleProductIds = useMemo(
    () => new Set(filteredResults.map((r) => r.product_id)),
    [filteredResults],
  );

  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const stats = computeCatalogueStats(aggregatedResults);

  const navigateToProduct = async (productId: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const product = aggregatedResults.find((r) => r.product_id === productId);
      const productDisplayName = product ? `${product.brand_name} ${product.product_name}` : "";

      setSelectedProductName(productDisplayName);
      setShowLoginPrompt(true);
      return;
    }

    navigate(`/product/${productId}`);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilters({ barista: false, properties: [], flavors: [], myResultsOnly: false });
  };

  // Only the ranking is a list of products; the charts and the map both
  // aggregate ratings, so the toolbar counts whatever the view is made of.
  // Every rating belongs to a product, so the slice's rating total is just the
  // surviving products' counts summed. Sort is the one control that stays
  // behind — none of its columns mean anything to a chart or a country.
  const listView = view === "table";
  const ratingCount = filteredResults.reduce((sum, r) => sum + r.count, 0);
  const totalRatings = aggregatedResults.reduce((sum, r) => sum + r.count, 0);

  const toolbarProps = {
    searchTerm,
    setSearchTerm,
    filters,
    onFiltersChange: setFilters,
    sortConfig,
    onSetSort: handleSetSort,
    onClearSort: handleClearSort,
    showMyResults: !!user,
    resultCount: listView ? filteredResults.length : ratingCount,
    totalCount: listView ? aggregatedResults.length : totalRatings,
    countNoun: listView ? "products" : "ratings",
    showSort: listView,
  };

  return (
    <StoryLayout mobileCtaHint="Add the one you tried today.">
      <Seo
        title="Results — Plant-milk ratings | Milk Me Not"
        description="Browse aggregated ratings of plant-based milks from the Milk Me Not community. Filter by brand, base type and barista performance."
        path="/results"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Plant-milk ratings",
          url: "https://milkmenot.com/results",
        }}
      />

      <ResultsHero stats={stats} isLoading={isLoading} />

      <Band ground="paper" size="lg">
        <SectionHead
          kicker="Browse everything"
          title={<>Sort it your way</>}
          size="md"
          trailing={!isMobile && <ResultsViewSwitcher view={view} onViewChange={setView} />}
        />

        {/* On a phone the switcher gets its own full-width row — beside the
            heading it would either wrap or squeeze the title. */}
        {isMobile && (
          <ResultsViewSwitcher view={view} onViewChange={setView} className="mt-6 flex w-full" />
        )}

        <div className="mt-7">
          {isMobile ? <ResultsToolbarMobile {...toolbarProps} /> : <ResultsToolbarDesktop {...toolbarProps} />}
        </div>

        <div className="mt-8">
          {isLoading ? (
            <ResultsSkeleton />
          ) : view === "table" ? (
            filteredResults.length === 0 ? (
              <ResultsEmptyState onClear={clearAllFilters} />
            ) : isMobile ? (
              <ResultsCardList results={visibleResults} onProductClick={navigateToProduct} />
            ) : (
              <ResultsRankedList
                results={visibleResults}
                sortConfig={sortConfig}
                onSort={handleSort}
                onProductClick={navigateToProduct}
              />
            )
          ) : view === "charts" ? (
            <ResultsCharts visibleProductIds={visibleProductIds} />
          ) : (
            <Suspense
              fallback={
                <div className="flex min-h-[60vh] items-center justify-center">
                  <Loader className="h-8 w-8 animate-spin text-story-green" />
                </div>
              }
            >
              <MapboxWorldMap visibleProductIds={visibleProductIds} />
            </Suspense>
          )}
          {remaining > 0 && view === "table" && !isLoading && (
            <div className="mt-10 flex flex-col items-center gap-3">
              <StoryButton tone="outline" size="md" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                Show {Math.min(remaining, PAGE_SIZE)} more
              </StoryButton>
              <p className="text-[0.8125rem] font-medium text-story-muted-2">
                {visibleResults.length} of {filteredResults.length} shown
              </p>
            </div>
          )}
        </div>
      </Band>

      {/* Login prompt modal */}
      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        productName={selectedProductName}
      />
    </StoryLayout>
  );
};

export default Results;
