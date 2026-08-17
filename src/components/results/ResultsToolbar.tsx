import { useState } from "react";
import { ArrowUpDown, Search, SlidersHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { sanitizeInput } from "@/lib/security";
import { ResultsFilterPanel } from "./ResultsFilterPanel";
import { ResultsSortList } from "./ResultsSortList";
import { findSortLabel } from "./sortOptions";
import type { FilterOptions } from "@/hooks/useResultsState";
import type { SortConfig } from "@/hooks/useAggregatedResults";

type ToolbarProps = {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  sortConfig: SortConfig;
  onSetSort: (column: string, direction: "asc" | "desc") => void;
  onClearSort: () => void;
  showMyResults: boolean;
  resultCount: number;
  totalCount: number;
  /**
   * What the view underneath is counting. The charts aggregate ratings, not
   * products, so "220 of 220 products" would be counting the wrong thing.
   */
  countNoun?: string;
  /** Sort only reorders the ranked list, so the charts hide the control. */
  showSort?: boolean;
};

const activeFilterCount = (filters: FilterOptions) =>
  (filters.barista ? 1 : 0) + (filters.myResultsOnly ? 1 : 0) + filters.properties.length + filters.flavors.length;

const SearchField = ({
  searchTerm,
  setSearchTerm,
  className,
}: {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  className?: string;
}) => (
  <div className={cn("relative", className)}>
    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-story-muted-2" aria-hidden />
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(sanitizeInput(e.target.value).slice(0, 100))}
      placeholder="Search brand or product…"
      maxLength={100}
      className="h-11 w-full rounded-full border-[1.5px] border-story-ink/12 bg-white pl-11 pr-4 text-[0.9375rem] font-medium text-story-ink placeholder:text-story-muted-2 focus:border-story-green focus:outline-none"
    />
  </div>
);

/** Search, sort and filter, laid out for a wide viewport with room to spare. */
export const ResultsToolbarDesktop = ({
  searchTerm,
  setSearchTerm,
  filters,
  onFiltersChange,
  sortConfig,
  onSetSort,
  onClearSort,
  showMyResults,
  resultCount,
  totalCount,
  countNoun = "products",
  showSort = true,
}: ToolbarProps) => {
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterCount = activeFilterCount(filters);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <SearchField searchTerm={searchTerm} setSearchTerm={setSearchTerm} className="max-w-md flex-1" />

        <Popover open={sortOpen && showSort} onOpenChange={setSortOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              hidden={!showSort}
              className={cn(
                "h-11 flex-shrink-0 items-center gap-2 rounded-full border-[1.5px] border-story-ink/12 bg-white px-4 text-[0.8125rem] font-bold text-story-ink-2 transition-colors hover:bg-story-cream-2",
                showSort ? "flex" : "hidden",
              )}
            >
              <ArrowUpDown className="h-4 w-4" aria-hidden />
              {findSortLabel(sortConfig)}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[25rem] rounded-2xl border-story-ink/10 p-4">
            <div className="mb-1 flex items-center justify-between">
              <p className="story-kicker text-story-muted-2">Sort by</p>
              <button type="button" onClick={onClearSort} className="text-[0.75rem] font-bold text-story-green-dark hover:underline">
                Reset
              </button>
            </div>
            <ResultsSortList
              sortConfig={sortConfig}
              onSelect={(column, direction) => {
                onSetSort(column, direction);
                setSortOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>

        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex h-11 flex-shrink-0 items-center gap-2 rounded-full border-[1.5px] px-4 text-[0.8125rem] font-bold transition-colors",
                filterCount > 0
                  ? "border-story-green bg-story-green text-white"
                  : "border-story-ink/12 bg-white text-story-ink-2 hover:bg-story-cream-2",
              )}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              Filter
              {filterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[0.6875rem] font-extrabold text-story-green-dark">
                  {filterCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 rounded-2xl border-story-ink/10 p-4">
            <ResultsFilterPanel filters={filters} onFiltersChange={onFiltersChange} showMyResults={showMyResults} />
          </PopoverContent>
        </Popover>
      </div>

      <p className="text-[0.8125rem] font-medium text-story-muted-2">
        Showing <span className="font-bold text-story-ink">{resultCount}</span> of {totalCount} {countNoun}
      </p>
    </div>
  );
};

/** Same three capabilities, composed as a phone would want them: full-width
 *  search up top, a chip row that opens bottom sheets rather than popovers. */
export const ResultsToolbarMobile = ({
  searchTerm,
  setSearchTerm,
  filters,
  onFiltersChange,
  sortConfig,
  onSetSort,
  onClearSort,
  showMyResults,
  resultCount,
  totalCount,
}: ToolbarProps) => {
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterCount = activeFilterCount(filters);

  return (
    <div className="flex flex-col gap-3">
      <SearchField searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="story-rail flex items-center gap-2">
        <Sheet open={sortOpen} onOpenChange={setSortOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex h-10 flex-shrink-0 items-center gap-1.5 rounded-full border-[1.5px] border-story-ink/12 bg-white px-3.5 text-[0.8125rem] font-bold text-story-ink-2"
            >
              <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
              {findSortLabel(sortConfig)}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-[1.5rem] border-story-ink/10 bg-story-cream">
            <SheetHeader className="text-left">
              <SheetTitle className="story-serif text-[1.25rem] font-bold text-story-ink">Sort by</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <ResultsSortList
                sortConfig={sortConfig}
                onSelect={(column, direction) => {
                  onSetSort(column, direction);
                  setSortOpen(false);
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                onClearSort();
                setSortOpen(false);
              }}
              className="mt-2 self-start text-[0.8125rem] font-bold text-story-green-dark"
            >
              Reset to default
            </button>
          </SheetContent>
        </Sheet>

        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex h-10 flex-shrink-0 items-center gap-1.5 rounded-full border-[1.5px] px-3.5 text-[0.8125rem] font-bold",
                filterCount > 0 ? "border-story-green bg-story-green text-white" : "border-story-ink/12 bg-white text-story-ink-2",
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
              Filter{filterCount > 0 ? ` · ${filterCount}` : ""}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="flex max-h-[85vh] flex-col overflow-y-auto rounded-t-[1.5rem] border-story-ink/10 bg-story-cream">
            <SheetHeader className="text-left">
              <SheetTitle className="story-serif text-[1.25rem] font-bold text-story-ink">Filter</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex-1 pb-4">
              <ResultsFilterPanel filters={filters} onFiltersChange={onFiltersChange} showMyResults={showMyResults} />
            </div>
            <SheetFooter>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="w-full rounded-full bg-story-green py-3.5 text-[0.9375rem] font-bold text-white"
              >
                Show {resultCount} products
              </button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <p className="text-[0.75rem] font-medium text-story-muted-2">
        {resultCount} of {totalCount} products
      </p>
    </div>
  );
};
