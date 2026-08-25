import { useState, useMemo, lazy, Suspense } from "react";
import { Loader } from "lucide-react";
import { Seo } from "@/components/Seo";
import { useAggregatedResults } from "@/hooks/useAggregatedResults";
import { useResultsUrlState, useResultsFiltering } from "@/hooks/useResultsState";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePagedCount } from "@/hooks/usePagedCount";
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

  const { data: aggregatedResults = [], isLoading } = useAggregatedResults(sortConfig);
  const { filteredResults } = useResultsFiltering(aggregatedResults, searchTerm, filters);

  // 220 rows at once makes a 23,000px page nobody reaches the bottom of, so the
  // list arrives a screenful at a time. Any change to the query starts over.
  const [visibleCount, setVisibleCount] = usePagedCount(PAGE_SIZE, [
    searchTerm,
    filters,
    sortConfig,
  ]);
  const visibleResults = filteredResults.slice(0, visibleCount);
  const remaining = filteredResults.length - visibleResults.length;

  // The charts read raw ratings, but must show the same slice as the ranking —
  // so they follow the products that survived filtering rather than filtering
  // twice against two different grains.
  const visibleProductIds = useMemo(
    () => new Set(filteredResults.map((r) => r.product_id)),
    [filteredResults],
  );

  const isMobile = useIsMobile();
  const { user } = useAuth();

  const stats = computeCatalogueStats(aggregatedResults);

  /**
   * Product pages are public, and the gate lives one layer down.
   *
   * Clicking a row used to check for a session and show a login prompt
   * instead of navigating. That was a second, stricter gate than the one the
   * product page already applies: useProductTests withholds usernames, notes
   * and photos from signed-out visitors while still serving the score, the
   * tier and the distribution. Blocking the route meant nobody ever saw that
   * — no search engine could reach 220 product pages, no one could share a
   * carton with a friend without an account, and a stranger was asked to sign
   * up before being shown anything worth signing up for.
   *
   * The rows are plain links now. What is private stays private because it is
   * withheld at the query, not hidden behind navigation.
   */

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

      {/* Same seam as the feed: cream head into a paper band. See Feed.tsx. */}
      <Band
        ground="paper"
        size={user && isMobile ? "sm" : "lg"}
        className={cn(user && "bg-story-cream lg:bg-story-paper")}
      >
        {/* "Browse everything / Sort it your way" introduces a switcher and a
            sort control that say the same thing themselves. A first-time reader
            gets the signpost; a member on a phone gets the controls. */}
        {!(user && isMobile) && (
          <SectionHead
            kicker="Browse everything"
            title={<>Sort it your way</>}
            size="md"
            trailing={!isMobile && <ResultsViewSwitcher view={view} onViewChange={setView} />}
          />
        )}

        {/* On a phone the switcher gets its own full-width row — beside the
            heading it would either wrap or squeeze the title. */}
        {isMobile && (
          <ResultsViewSwitcher view={view} onViewChange={setView} className={cn("flex w-full", !user && "mt-6")} />
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
              <ResultsCardList results={visibleResults} />
            ) : (
              <ResultsRankedList
                results={visibleResults}
                sortConfig={sortConfig}
                onSort={handleSort}
               
              />
            )
          ) : view === "charts" ? (
            <ResultsCharts visibleProductIds={visibleProductIds} />
          ) : (
            <Suspense
              fallback={
                <div className="flex min-h-[60vh] items-center justify-center">
                  <Loader className="h-8 w-8 animate-spin text-story-green-dark" />
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
    </StoryLayout>
  );
};

export default Results;
