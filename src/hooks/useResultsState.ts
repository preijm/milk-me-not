import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SortConfig, AggregatedResult } from "@/hooks/useAggregatedResults";

export interface FilterOptions {
  barista: boolean;
  properties: string[];
  flavors: string[];
  myResultsOnly: boolean;
}

const DEFAULT_SORT_CONFIG: SortConfig = {
  column: "avg_rating",
  direction: "desc",
};

export function useResultsUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();
  const isInitialMount = useRef(true);

  // Parse filters from URL params
  const parseFiltersFromUrl = (): FilterOptions => {
    const barista = searchParams.get("barista") === "true";
    const properties =
      searchParams.get("properties")?.split(",").filter(Boolean) || [];
    const flavors =
      searchParams.get("flavors")?.split(",").filter(Boolean) || [];
    const myResultsOnly = searchParams.get("myResultsOnly") === "true";
    return { barista, properties, flavors, myResultsOnly };
  };

  // Parse sort config from URL params
  const parseSortConfigFromUrl = (): SortConfig => {
    const column =
      (searchParams.get("sortColumn") as SortConfig["column"]) || "avg_rating";
    const direction =
      (searchParams.get("sortDir") as SortConfig["direction"]) || "desc";
    return { column, direction };
  };

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [sortConfig, setSortConfig] = useState<SortConfig>(
    parseSortConfigFromUrl
  );
  const [filters, setFilters] = useState<FilterOptions>(parseFiltersFromUrl);

  // Sync state from URL params when navigating back
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const urlFilters = parseFiltersFromUrl();
    const urlSortConfig = parseSortConfigFromUrl();
    const urlSearchTerm = searchParams.get("search") || "";

    setFilters(urlFilters);
    setSortConfig(urlSortConfig);
    setSearchTerm(urlSearchTerm);
  }, [searchParams]);

  // Update URL when search term, filters, or sort changes
  useEffect(() => {
    const params: Record<string, string> = {};

    if (searchTerm) params.search = searchTerm;
    if (filters.barista) params.barista = "true";
    if (filters.properties.length > 0)
      params.properties = filters.properties.join(",");
    if (filters.flavors.length > 0) params.flavors = filters.flavors.join(",");
    if (filters.myResultsOnly) params.myResultsOnly = "true";
    if (
      sortConfig.column !== DEFAULT_SORT_CONFIG.column ||
      sortConfig.direction !== DEFAULT_SORT_CONFIG.direction
    ) {
      params.sortColumn = sortConfig.column;
      params.sortDir = sortConfig.direction;
    }

    setSearchParams(params, { replace: true });

    // Store the full Results URL in sessionStorage for navigation back
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `/results?${queryString}` : "/results";
    sessionStorage.setItem("lastResultsUrl", fullUrl);
  }, [searchTerm, filters, sortConfig, setSearchParams]);

  // Check if we should enable myResultsOnly filter from navigation state
  useEffect(() => {
    if (location.state?.myResultsOnly && user) {
      setFilters((prev) => ({ ...prev, myResultsOnly: true }));
      window.history.replaceState({}, document.title);
    }
  }, [location.state, user]);

  const handleSort = (column: string) => {
    setSortConfig((current) => ({
      column,
      direction:
        current.column === column && current.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handleSetSort = (column: string, direction: "asc" | "desc") => {
    setSortConfig({ column, direction });
  };

  const handleClearSort = () => {
    setSortConfig(DEFAULT_SORT_CONFIG);
  };

  return {
    searchTerm,
    setSearchTerm,
    sortConfig,
    filters,
    setFilters,
    handleSort,
    handleSetSort,
    handleClearSort,
  };
}

export function useResultsFiltering(
  aggregatedResults: AggregatedResult[],
  searchTerm: string,
  filters: FilterOptions
) {
  const { user } = useAuth();

  // Fetch user's own tests to filter products
  const { data: userTests = [] } = useQuery({
    queryKey: ["user-tests-for-filter"],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("milk_tests_view")
        .select("product_id")
        .eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user && filters.myResultsOnly,
  });

  // Fetch properties and flavors to create key-to-name mapping
  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .order("ordering", { ascending: true });
      return data || [];
    },
  });

  const { data: flavors = [] } = useQuery({
    queryKey: ["flavors"],
    queryFn: async () => {
      const { data } = await supabase
        .from("flavors")
        .select("*")
        .order("ordering", { ascending: true });
      return data || [];
    },
  });

  // Create mappings from keys to names
  const propertyKeyToName = useMemo(
    () => new Map(properties.map((p) => [p.key, p.name])),
    [properties]
  );
  const flavorKeyToName = useMemo(
    () => new Map(flavors.map((f) => [f.key, f.name])),
    [flavors]
  );

  const filteredResults = useMemo(() => {
    return aggregatedResults.filter((result) => {
      const searchString = searchTerm.toLowerCase();
      const matchesSearch =
        (result.brand_name || "").toLowerCase().includes(searchString) ||
        (result.product_name || "").toLowerCase().includes(searchString) ||
        (result.property_names || []).some(p => p.toLowerCase().includes(searchString)) ||
        (result.flavor_names || []).some(f => f.toLowerCase().includes(searchString)) ||
        (result.is_barista && "barista".includes(searchString));

      // Filter by My Results Only
      if (filters.myResultsOnly && user) {
        const userProductIds = new Set(userTests.map((t) => t.product_id));
        if (!userProductIds.has(result.product_id)) {
          return false;
        }
      }

      // Filter by Barista
      if (filters.barista && !result.is_barista) {
        return false;
      }

      // Filter by Properties
      if (filters.properties.length > 0) {
        const filterPropertyNames = filters.properties
          .map((key) => propertyKeyToName.get(key))
          .filter(Boolean);
        const hasMatchingProperty = filterPropertyNames.some((filterPropName) =>
          result.property_names?.includes(filterPropName as string)
        );
        if (!hasMatchingProperty) {
          return false;
        }
      }

      // Filter by Flavors
      if (filters.flavors.length > 0) {
        const filterFlavorNames = filters.flavors
          .map((key) => flavorKeyToName.get(key))
          .filter(Boolean);
        const hasMatchingFlavor = filterFlavorNames.some((filterFlavorName) =>
          result.flavor_names?.includes(filterFlavorName as string)
        );
        if (!hasMatchingFlavor) {
          return false;
        }
      }

      return matchesSearch;
    });
  }, [
    aggregatedResults,
    searchTerm,
    filters,
    user,
    userTests,
    propertyKeyToName,
    flavorKeyToName,
  ]);

  return { filteredResults };
}
