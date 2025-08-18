import React, { useState } from "react";
import { useAggregatedResults, SortConfig } from "@/hooks/useAggregatedResults";
import { useNavigate } from "react-router-dom";
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
interface FilterOptions {
  barista: boolean;
  properties: string[];
  flavors: string[];
}
const Results = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: 'most_recent_date',
    direction: 'desc'
  });
  const [view, setView] = useState<'table' | 'charts' | 'map'>('table');
  const [filters, setFilters] = useState<FilterOptions>({
    barista: false,
    properties: [],
    flavors: []
  });
  const {
    data: aggregatedResults = [],
    isLoading
  } = useAggregatedResults(sortConfig);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
      column: 'most_recent_date',
      direction: 'desc'
    });
  };
  const navigateToProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };
  const filteredResults = aggregatedResults.filter(result => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = (result.brand_name || "").toLowerCase().includes(searchString) || (result.product_name || "").toLowerCase().includes(searchString);

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
        <div className="container max-w-6xl mx-auto px-4 py-8 pt-24 pb-20 sm:pb-8 relative z-10">
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
            <MilkCharts results={chartsData} />
          ) : (
            <MapboxWorldMap />
          )}
        </div>
      </BackgroundPattern>
      
      <MobileFooter />
    </div>;
};
export default Results;