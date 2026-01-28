import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface CountryTestCount {
  country_code: string;
  test_count: number;
}

const MapboxWorldMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const initAttempted = useRef(false);
  const loadTimeoutRef = useRef<number | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

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
      console.log('MapboxWorldMap: Fetching Mapbox token...');
      
      // Verify we have a session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('MapboxWorldMap: Session check:', session ? 'authenticated' : 'not authenticated', sessionError ? sessionError.message : '');
      
      if (!session) {
        console.error('MapboxWorldMap: No active session found');
        setMapError('Authentication required to load map');
        return null;
      }
      
      console.log('MapboxWorldMap: Invoking edge function...');
    const { data, error } = await supabase.functions.invoke('get-mapbox-token', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
      
      if (error) {
        console.error('MapboxWorldMap: Error invoking function:', error);
        throw error;
      }
      
      console.log('MapboxWorldMap: Token fetched successfully, length:', data?.token?.length || 0);
      return data.token;
    } catch (error) {
      console.error('MapboxWorldMap: Error fetching Mapbox token:', error);
      return null;
    }
  };

  // Interpolate between colors for smooth heatmap gradient (grey to green)
  const interpolateColor = (value: number, min: number, max: number): string => {
    // Normalize value between 0 and 1 using logarithmic scale for better distribution
    const normalized = Math.log(value + 1) / Math.log(max + 1);
    const clamped = Math.max(0, Math.min(1, normalized));
    
    // Gradient from grey (#e5e7eb) to green (#00bf63)
    const grey = [229, 231, 235];  // #e5e7eb
    const green = [0, 191, 99];    // #00bf63
    
    const r = Math.round(grey[0] + clamped * (green[0] - grey[0]));
    const g = Math.round(grey[1] + clamped * (green[1] - grey[1]));
    const b = Math.round(grey[2] + clamped * (green[2] - grey[2]));
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getCountryColor = (testCount: number): string => {
    if (testCount === 0) return '#e5e7eb'; // Light gray for no data
    
    // Find max for scaling (use 150 as reasonable max for good distribution)
    const maxForScale = 150;
    return interpolateColor(testCount, 1, maxForScale);
  };

  const initializeMap = async () => {
    console.log('MapboxWorldMap: initializeMap called');
    console.log('MapboxWorldMap: mapContainer.current:', !!mapContainer.current);
    console.log('MapboxWorldMap: map.current:', !!map.current);
    
    if (!mapContainer.current || map.current) {
      console.log('MapboxWorldMap: Early return - container missing or map already exists');
      return;
    }

    // Guard: Mapbox GL requires WebGL
    if (typeof mapboxgl.supported === 'function' && !mapboxgl.supported()) {
      setMapError('Your browser/device does not support WebGL, so the map cannot be displayed.');
      return;
    }

    // Wait until the container has a real size (tab switch/layout can mount at 0x0 for a frame)
    for (let attempt = 0; attempt < 12; attempt++) {
      const el = mapContainer.current;
      const w = el?.clientWidth ?? 0;
      const h = el?.clientHeight ?? 0;
      if (w > 0 && h > 0) break;
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }

    if (!mapContainer.current || mapContainer.current.clientWidth === 0 || mapContainer.current.clientHeight === 0) {
      setMapError('Map container has no size yet. Please retry.');
      return;
    }

    const token = await fetchMapboxToken();
    console.log('MapboxWorldMap: Token received:', token ? 'yes (length: ' + token.length + ')' : 'no');
    
    if (!token) {
      console.error('No Mapbox token available');
      setMapError('Unable to load map token. Please check the MAPBOX_KEY secret.');
      return;
    }

    // Guard: Mapbox GL JS expects a public token (pk.*)
    if (!token.startsWith('pk.')) {
      setMapError('Invalid Mapbox token format. Please use a public token that starts with “pk.”');
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
        attributionControl: false,
      });

      // Add compact attribution control (no duplicates, no "Improve this map" link)
      map.current.addControl(new mapboxgl.AttributionControl({
        compact: true,
      }), 'bottom-right');

      console.log('MapboxWorldMap: Map instance created');

      // If load never fires (token/style/network), surface an error instead of staying blank
      if (loadTimeoutRef.current) window.clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = window.setTimeout(() => {
        console.error('MapboxWorldMap: Map load timeout');
        setMapError('Map took too long to load. Please retry or check your network connection.');
      }, 12000);

      map.current.on('error', (e) => {
        console.error('Mapbox map error event:', e);
        setMapError('Map failed to load. Check browser console for details.');
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        console.log('MapboxWorldMap: Map loaded successfully!');
        if (loadTimeoutRef.current) {
          window.clearTimeout(loadTimeoutRef.current);
          loadTimeoutRef.current = null;
        }
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

    const sourceId = 'country-boundaries';

    // Ensure source exists
    if (!map.current.getSource(sourceId)) {
      map.current.addSource(sourceId, {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1',
      });
    }

    // If layers already exist (e.g., react-query refetch), remove them to re-add with new data
    if (map.current.getLayer('country-fills')) map.current.removeLayer('country-fills');
    if (map.current.getLayer('country-borders')) map.current.removeLayer('country-borders');

    // Create country data expression for fill-color
    const countryColorExpression: mapboxgl.ExpressionSpecification = ['case'];

    countryData.forEach((country) => {
      countryColorExpression.push(
        ['==', ['get', 'iso_3166_1'], country.country_code],
        getCountryColor(country.test_count)
      );
    });

    // Default color for countries with no data
    countryColorExpression.push('#f3f4f6');

    map.current.addLayer({
      id: 'country-fills',
      type: 'fill',
      source: sourceId,
      'source-layer': 'country_boundaries',
      paint: {
        'fill-color': countryColorExpression,
        'fill-opacity': 0.7,
      },
    });

    map.current.addLayer({
      id: 'country-borders',
      type: 'line',
      source: sourceId,
      'source-layer': 'country_boundaries',
      paint: {
        'line-color': '#ffffff',
        'line-width': 1,
      },
    });

    // Add click handler for countries (avoid stacking listeners)
    map.current.off('click', 'country-fills', onCountryClick);
    map.current.on('click', 'country-fills', onCountryClick);

    // Change cursor on hover
    map.current.off('mouseenter', 'country-fills', onCountryEnter);
    map.current.off('mouseleave', 'country-fills', onCountryLeave);
    map.current.on('mouseenter', 'country-fills', onCountryEnter);
    map.current.on('mouseleave', 'country-fills', onCountryLeave);
  };

  const onCountryClick = (e: mapboxgl.MapLayerMouseEvent) => {
    if (!map.current) return;
    if (e.features && e.features[0]) {
      const feature = e.features[0];
      const properties = feature.properties as { iso_3166_1?: string; name?: string } | null;
      const countryCode = properties?.iso_3166_1;
      const countryName = properties?.name;
      const country = countryData.find((c) => c.country_code === countryCode);
      const testCount = country ? country.test_count : 0;

      new mapboxgl.Popup({ closeButton: true, className: 'custom-popup' })
        .setLngLat(e.lngLat)
        .setHTML(`
            <div style="padding: 16px; min-width: 140px;">
              <h3 style="font-weight: 700; font-size: 18px; margin: 0 0 8px 0; color: #1f2937;">${countryName || countryCode}</h3>
              <p style="font-size: 20px; font-weight: 600; margin: 0; color: ${getCountryColor(testCount)};">
                ${testCount} ${testCount === 1 ? 'test result' : 'test results'}
              </p>
            </div>
          `)
        .addTo(map.current);
    }
  };

  const onCountryEnter = () => {
    if (!map.current) return;
    map.current.getCanvas().style.cursor = 'pointer';
  };

  const onCountryLeave = () => {
    if (!map.current) return;
    map.current.getCanvas().style.cursor = '';
  };

  // Retry handler for the map
  const handleRetry = () => {
    console.log('MapboxWorldMap: Retry requested');
    setMapError(null);
    initAttempted.current = false;
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    setIsMapInitialized(false);
    setIsInitializing(true);
    
    initializeMap().finally(() => {
      setIsInitializing(false);
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('MapboxWorldMap: Cleanup');
      if (loadTimeoutRef.current) {
        window.clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Initialize once data is loaded and the container ref exists.
  // Important: keep the map container mounted while initializing; otherwise the ref is null
  // and initialization will bail out and never retry.
  useEffect(() => {
    if (isLoading) return;
    if (map.current) return;
    if (initAttempted.current) {
      console.log('MapboxWorldMap: Skipping duplicate initialization');
      return;
    }

    let cancelled = false;

    const attemptInit = async () => {
      if (cancelled) return;
      if (!mapContainer.current) {
        // Wait until after first paint / tab content mount
        requestAnimationFrame(attemptInit);
        return;
      }

      console.log('MapboxWorldMap: Starting initialization...');
      initAttempted.current = true;
      setIsInitializing(true);

      try {
        await initializeMap();
      } catch (error) {
        console.error('MapboxWorldMap: Failed to initialize:', error);
        setMapError('Failed to initialize map. Please try again.');
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    };

    attemptInit();

    return () => {
      cancelled = true;
    };
  }, [isLoading]);

  useEffect(() => {
    if (isMapInitialized && countryData.length > 0) {
      addCountryData();
    }
  }, [isMapInitialized, countryData]);

  const totalTests = countryData.reduce((sum, country) => sum + country.test_count, 0);
  const discoveryPercentage = Math.round((countryData.length / totalCountries) * 100);

  // Animated counter effect
  useEffect(() => {
    if (discoveryPercentage > 0) {
      const duration = 1500;
      const steps = 30;
      const increment = discoveryPercentage / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= discoveryPercentage) {
          setAnimatedPercentage(discoveryPercentage);
          clearInterval(timer);
        } else {
          setAnimatedPercentage(Math.round(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [discoveryPercentage]);

  return (
    <div className="w-full space-y-6">
      {/* Discovery Message */}
      <div className="text-center py-4">
        <p className="text-xl md:text-2xl font-semibold text-foreground">
          Plant-based milk alternatives mapped in{' '}
          <span className="text-primary font-bold">{animatedPercentage}%</span>{' '}
          of countries worldwide 🌍
        </p>
      </div>

      {/* Legend - Gradient bar */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <span className="text-sm text-muted-foreground">No tests</span>
        <div 
          className="w-96 h-4 rounded-full"
          style={{
            background: 'linear-gradient(to right, #e5e7eb, #00bf63)'
          }}
        />
        <span className="text-sm text-muted-foreground">More tests</span>
      </div>

      {/* Mapbox Map */}
      <div className="w-full h-[600px] rounded-lg border border-border shadow-lg overflow-hidden relative">
        <div ref={mapContainer} className="w-full h-full" />

        {(isLoading || isInitializing) && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <div className="text-sm text-muted-foreground">
              {isLoading ? 'Loading map data…' : 'Initializing map…'}
            </div>
          </div>
        )}

        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80 backdrop-blur-sm">
            <div className="text-center p-6 max-w-md">
              <p className="text-foreground font-semibold mb-2">{mapError}</p>
              <p className="text-sm text-muted-foreground mb-4">
                This could be due to network issues, authentication problems, or missing Mapbox configuration.
              </p>
              <Button onClick={handleRetry} variant="default" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
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
            return sortedData.map((country, index) => {
              const percentage = (country.test_count / totalTests) * 100;
              return (
                <div
                  key={country.country_code}
                  className="relative flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
                >
                  <div 
                    className="absolute inset-y-0 left-0 bg-emerald-500/15 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="relative flex items-center gap-4">
                    <span className="text-sm font-medium w-6 text-foreground">
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">
                      {countryCodeToName.get(country.country_code) || country.country_code}
                    </span>
                  </div>
                  <span className="relative text-lg font-bold text-foreground">
                    {country.test_count} <span className="text-sm font-normal text-muted-foreground">({Math.round(percentage)}%)</span>
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