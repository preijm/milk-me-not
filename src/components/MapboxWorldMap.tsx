import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';


interface CountryTestCount {
  country_code: string;
  test_count: number;
}

const MapboxWorldMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Fetch test counts per country
  const { data: countryData = [], isLoading } = useQuery({
    queryKey: ['country-test-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milk_tests')
        .select('country_code')
        .not('country_code', 'is', null);
      
      if (error) throw error;
      
      // Count tests per country
      const counts: Record<string, number> = {};
      data.forEach(test => {
        if (test.country_code) {
          counts[test.country_code] = (counts[test.country_code] || 0) + 1;
        }
      });
      
      return Object.entries(counts).map(([country_code, test_count]) => ({
        country_code,
        test_count
      })) as CountryTestCount[];
    },
  });

  // Fetch countries with names for display
  const { data: countriesData = [] } = useQuery({
    queryKey: ['countries-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('code, name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Create a map from country code to country name
  const countryCodeToName = new Map(countriesData.map(c => [c.code, c.name]));
  const totalCountries = countriesData.length || 195;

  // Fetch Mapbox token from Supabase Edge Function
  const fetchMapboxToken = async () => {
    try {
      console.log('Fetching Mapbox token...');
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) {
        console.error('Error invoking function:', error);
        throw error;
      }
      console.log('Token fetched successfully:', data);
      return data.token;
    } catch (error) {
      console.error('Error fetching Mapbox token:', error);
      return null;
    }
  };

  const getCountryColor = (testCount: number): string => {
    if (testCount >= 100) return '#dc2626'; // Red - Very High
    if (testCount >= 50) return '#ea580c'; // Orange - High  
    if (testCount >= 20) return '#f59e0b'; // Amber - Medium-High
    if (testCount >= 10) return '#eab308'; // Yellow - Medium
    if (testCount >= 5) return '#84cc16'; // Lime - Low-Medium
    if (testCount >= 1) return '#22c55e'; // Green - Low
    return '#e5e7eb'; // Light gray for no data
  };

  const initializeMap = async () => {
    console.log('MapboxWorldMap: initializeMap called');
    console.log('MapboxWorldMap: mapContainer.current:', !!mapContainer.current);
    console.log('MapboxWorldMap: map.current:', !!map.current);
    
    if (!mapContainer.current || map.current) {
      console.log('MapboxWorldMap: Early return - container missing or map already exists');
      return;
    }

    const token = await fetchMapboxToken();
    console.log('MapboxWorldMap: Token received:', token ? 'yes (length: ' + token.length + ')' : 'no');
    
    if (!token) {
      console.error('No Mapbox token available');
      setMapError('Unable to load map token. Please check the MAPBOX_KEY secret.');
      return;
    }

    try {
      console.log('MapboxWorldMap: Setting access token and creating map...');
      mapboxgl.accessToken = token;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        zoom: 2,
        center: [0, 30],
        projection: 'globe',
      });

      console.log('MapboxWorldMap: Map instance created');

      map.current.on('error', (e) => {
        console.error('Mapbox map error event:', e);
        setMapError('Map failed to load. Check browser console for details.');
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        console.log('MapboxWorldMap: Map loaded successfully!');
        setIsMapInitialized(true);
        setMapError(null);
        
        // Add atmosphere for globe
        if (map.current) {
          map.current.setFog({
            color: 'rgb(186, 210, 235)',
            'high-color': 'rgb(36, 92, 223)',
            'horizon-blend': 0.02,
            'space-color': 'rgb(11, 11, 25)',
            'star-intensity': 0.6,
          });
        }
      });

      // Add rotation
      let userInteracting = false;
      const spinGlobe = () => {
        if (!map.current) return;
        const zoom = map.current.getZoom();
        if (!userInteracting && zoom < 5) {
          const center = map.current.getCenter();
          center.lng -= 0.2;
          map.current.easeTo({ center, duration: 1000, easing: (n) => n });
        }
      };

      map.current.on('mousedown', () => { userInteracting = true; });
      map.current.on('mouseup', () => { userInteracting = false; spinGlobe(); });
      map.current.on('dragend', () => { spinGlobe(); });
      map.current.on('pitchend', () => { spinGlobe(); });
      map.current.on('rotateend', () => { spinGlobe(); });
      map.current.on('moveend', () => { spinGlobe(); });

      spinGlobe();
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Map initialization failed');
    }
  };

  const addCountryData = () => {
    if (!map.current || !isMapInitialized || !countryData.length) return;

    // Create country data expression for fill-color
    const countryColorExpression: any = ['case'];
    
    countryData.forEach(country => {
      countryColorExpression.push(
        ['==', ['get', 'iso_a2'], country.country_code],
        getCountryColor(country.test_count)
      );
    });
    
    // Default color for countries with no data
    countryColorExpression.push('#f3f4f6');

    // Add country fills
    map.current.addLayer({
      id: 'country-fills',
      type: 'fill',
      source: {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1',
      },
      'source-layer': 'country_boundaries',
      paint: {
        'fill-color': countryColorExpression,
        'fill-opacity': 0.7,
      },
    });

    // Add country borders
    map.current.addLayer({
      id: 'country-borders',
      type: 'line',
      source: {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1',
      },
      'source-layer': 'country_boundaries',
      paint: {
        'line-color': '#ffffff',
        'line-width': 1,
      },
    });

    // Add click handler for countries
    map.current.on('click', 'country-fills', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0];
        const countryCode = feature.properties?.iso_a2;
        const countryName = feature.properties?.name;
        const country = countryData.find(c => c.country_code === countryCode);
        const testCount = country ? country.test_count : 0;

        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <div class="p-3">
              <h3 class="font-bold text-lg">${countryName || countryCode}</h3>
              <p class="text-sm text-gray-600">Country Code: ${countryCode}</p>
              <p class="text-lg font-semibold mt-2" style="color: ${getCountryColor(testCount)}">
                ${testCount} milk ${testCount === 1 ? 'test' : 'tests'}
              </p>
            </div>
          `)
          .addTo(map.current!);
      }
    });

    // Change cursor on hover
    map.current.on('mouseenter', 'country-fills', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'country-fills', () => {
      map.current!.getCanvas().style.cursor = '';
    });
  };

  useEffect(() => {
    initializeMap();
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isMapInitialized && countryData.length > 0) {
      addCountryData();
    }
  }, [isMapInitialized, countryData]);

  const totalTests = countryData.reduce((sum, country) => sum + country.test_count, 0);
  const discoveryPercentage = Math.round((countryData.length / totalCountries) * 100);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Loading map data...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Discovery Message */}
      <div className="text-center bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-6 border border-primary/20">
        <p className="text-2xl md:text-3xl font-bold text-foreground">
          Together we've discovered{' '}
          <span className="text-primary">{discoveryPercentage}%</span>{' '}
          of the world of milk 🌍
        </p>
        <p className="text-muted-foreground mt-2">
          {countryData.length} out of {totalCountries} countries explored with {totalTests.toLocaleString()} tests
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-heatmap-very-high"></div>
          <span className="text-sm font-medium">100+ tests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-heatmap-high"></div>
          <span className="text-sm font-medium">50-99 tests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-heatmap-medium-high"></div>
          <span className="text-sm font-medium">20-49 tests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-heatmap-medium"></div>
          <span className="text-sm font-medium">10-19 tests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-heatmap-low-medium"></div>
          <span className="text-sm font-medium">5-9 tests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-heatmap-low"></div>
          <span className="text-sm font-medium">1-4 tests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-heatmap-none"></div>
          <span className="text-sm font-medium">No data</span>
        </div>
      </div>

      {/* Mapbox Map */}
      <div className="w-full h-[600px] rounded-lg border border-border shadow-lg overflow-hidden relative">
        <div ref={mapContainer} className="w-full h-full" />
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80 backdrop-blur-sm">
            <div className="text-center p-6">
              <p className="text-muted-foreground mb-2">{mapError}</p>
              <p className="text-sm text-muted-foreground">
                The interactive map works best in the published app.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Country Rankings */}
      <div className="bg-card rounded-lg border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Country Rankings</h3>
          <span className="text-sm text-muted-foreground">{countryData.length} countries</span>
        </div>
        <div className="divide-y divide-border">
          {(() => {
            const sortedData = [...countryData].sort((a, b) => b.test_count - a.test_count);
            const maxCount = sortedData[0]?.test_count || 1;
            return sortedData.map((country, index) => {
              const percentage = (country.test_count / maxCount) * 100;
              return (
                <div
                  key={country.country_code}
                  className="relative flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
                >
                  <div 
                    className="absolute inset-y-0 left-0 bg-primary/10 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="relative flex items-center gap-4">
                    <span className={`text-sm font-medium w-6 ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">
                      {countryCodeToName.get(country.country_code) || country.country_code}
                    </span>
                  </div>
                  <span className={`relative text-lg font-bold ${index === 0 ? 'text-primary' : 'text-foreground'}`}>
                    {country.test_count}
                  </span>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};

export default MapboxWorldMap;