import React, { useState, useMemo, useEffect } from "react";
import { useAggregatedResults, SortConfig } from "@/hooks/useAggregatedResults";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MenuBar from "@/components/MenuBar";
import BackgroundPattern from "@/components/BackgroundPattern";
import MobileFooter from "@/components/MobileFooter";
import { ResultsContainer } from "@/components/milk-test/ResultsContainer";
import { MilkCharts } from "@/components/MilkCharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartBar, Table2, MapPin } from "lucide-react";
import MapboxWorldMap from "@/components/MapboxWorldMap";
import { MilkTestResult } from "@/types/milk-test";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { useAuth } from "@/contexts/AuthContext";
interface FilterOptions {
  barista: boolean;
  properties: string[];
  flavors: string[];
  myResultsOnly: boolean;
}
const Results = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: 'avg_rating',
    direction: 'desc'
  });
  const [view, setView] = useState<'table' | 'charts' | 'map'>('table');
  const [filters, setFilters] = useState<FilterOptions>({
    barista: false,
    properties: [],
    flavors: [],
    myResultsOnly: false
  });
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  
  const {
    data: aggregatedResults = [],
    isLoading
  } = useAggregatedResults(sortConfig);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Update URL when search term changes
  useEffect(() => {
    if (searchTerm) {
      setSearchParams({ search: searchTerm }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [searchTerm, setSearchParams]);

  // Check if we should enable myResultsOnly filter from navigation state
  useEffect(() => {
    if (location.state?.myResultsOnly && user) {
      setFilters(prev => ({ ...prev, myResultsOnly: true }));
      // Clear the state after applying the filter
      window.history.replaceState({}, document.title);
    }
  }, [location.state, user]);

  // Fetch user's own tests to filter products
  const { data: userTests = [] } = useQuery({
    queryKey: ['user-tests-for-filter'],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('milk_tests_view')
        .select('product_id')
        .eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user && filters.myResultsOnly
  });

  // Fetch properties and flavors to create key-to-name mapping
  const {
    data: properties = []
  } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const {
        data
      } = await supabase.from('properties').select('*').order('ordering', {
        ascending: true
      });
      return data || [];
    }
  });
  const {
    data: flavors = []
  } = useQuery({
    queryKey: ['flavors'],
    queryFn: async () => {
      const {
        data
      } = await supabase.from('flavors').select('*').order('ordering', {
        ascending: true
      });
      return data || [];
    }
  });

  // Create mappings from keys to names
  const propertyKeyToName = new Map(properties.map(p => [p.key, p.name]));
  const flavorKeyToName = new Map(flavors.map(f => [f.key, f.name]));
  const handleSort = (column: string) => {
    setSortConfig(current => ({
      column,
      direction: current.column === column && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  const handleClearSort = () => {
    setSortConfig({
      column: 'avg_rating',
      direction: 'desc'
    });
  };
  const navigateToProduct = async (productId: string) => {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Find the product name for the prompt
      const product = aggregatedResults.find(r => r.product_id === productId);
      const productDisplayName = product 
        ? `${product.brand_name} ${product.product_name}`
        : "";
      
      setSelectedProductName(productDisplayName);
      setShowLoginPrompt(true);
      return;
    }
    
    navigate(`/product/${productId}`);
  };
  const filteredResults = useMemo(() => {
    return aggregatedResults.filter(result => {
      const searchString = searchTerm.toLowerCase();
      const matchesSearch = (result.brand_name || "").toLowerCase().includes(searchString) || (result.product_name || "").toLowerCase().includes(searchString);

      // Filter by My Results Only
      if (filters.myResultsOnly && user) {
        const userProductIds = new Set(userTests.map(t => t.product_id));
        if (!userProductIds.has(result.product_id)) {
          return false;
        }
      }

      // Filter by Barista
      if (filters.barista && !result.is_barista) {
        return false;
      }

      // Filter by Properties - convert keys to names for comparison
      if (filters.properties.length > 0) {
        const filterPropertyNames = filters.properties.map(key => propertyKeyToName.get(key)).filter(Boolean);
        const hasMatchingProperty = filterPropertyNames.some(filterPropName => result.property_names?.includes(filterPropName));
        if (!hasMatchingProperty) {
          return false;
        }
      }

      // Filter by Flavors - convert keys to names for comparison
      if (filters.flavors.length > 0) {
        const filterFlavorNames = filters.flavors.map(key => flavorKeyToName.get(key)).filter(Boolean);
        const hasMatchingFlavor = filterFlavorNames.some(filterFlavorName => result.flavor_names?.includes(filterFlavorName));
        if (!hasMatchingFlavor) {
          return false;
        }
      }
      return matchesSearch;
    });
  }, [aggregatedResults, searchTerm, filters, user, userTests, propertyKeyToName, flavorKeyToName]);

  // Convert AggregatedResult[] to MilkTestResult[] for MilkCharts component
  const chartsData: MilkTestResult[] = filteredResults.map(result => ({
    id: result.product_id,
    created_at: new Date().toISOString(),
    // Use current date as fallback
    rating: result.avg_rating,
    brand_name: result.brand_name,
    product_name: result.product_name,
    property_names: result.property_names,
    flavor_names: result.flavor_names,
    is_barista: result.is_barista,
    product_id: result.product_id,
    brand_id: result.brand_id
  }));
  console.log("Charts data length:", chartsData.length);
  console.log("Sample charts data:", chartsData.length > 0 ? chartsData[0] : 'No data');
  console.log("Filtered results length:", filteredResults.length);
  if (isLoading) {
    return <div className="min-h-screen">
        <MenuBar />
        <BackgroundPattern>
          <div className="container max-w-5xl mx-auto px-4 py-8 pt-24">
            <div className="text-center mt-8">
              <div className="text-xl text-gray-600">Loading...</div>
            </div>
          </div>
        </BackgroundPattern>
      </div>;
  }
  return <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-24 pb-20 sm:pb-8 relative z-10">
          {/* Desktop only: View switcher */}
          {!isMobile && <div className="flex justify-end mb-8">
              <Tabs value={view} onValueChange={(v: 'table' | 'charts' | 'map') => setView(v)} className="w-auto">
                <TabsList className="grid w-[300px] grid-cols-3 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
                  <TabsTrigger value="table" className="flex items-center gap-2">
                    <Table2 className="w-4 h-4" />
                    <span>Table</span>
                  </TabsTrigger>
                  <TabsTrigger value="charts" className="flex items-center gap-2">
                    <ChartBar className="w-4 h-4" />
                    <span>Chart</span>
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Map</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>}

          {/* Mobile: Always table view, Desktop: conditional view */}
          {isMobile || view === 'table' ? (
            <ResultsContainer 
              filteredResults={filteredResults} 
              sortConfig={sortConfig} 
              handleSort={handleSort} 
              onClearSort={handleClearSort} 
              onProductClick={navigateToProduct} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              filters={filters} 
              onFiltersChange={setFilters} 
            />
          ) : view === 'charts' ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
              <ChartBar className="w-16 h-16 text-muted-foreground/50" />
              <h2 className="text-3xl font-semibold text-foreground">Coming Soon</h2>
              <p className="text-muted-foreground max-w-md">
                We're working on bringing you insightful charts and analytics. Check back soon!
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
              <MapPin className="w-16 h-16 text-muted-foreground/50" />
              <h2 className="text-3xl font-semibold text-foreground">Coming Soon</h2>
              <p className="text-muted-foreground max-w-md">
                We're working on bringing you a global map of taste tests. Check back soon!
              </p>
            </div>
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
    </div>;
};
export default Results;