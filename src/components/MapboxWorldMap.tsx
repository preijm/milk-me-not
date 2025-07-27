import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

interface CountryTestCount {
  country_code: string;
  test_count: number;
}

const MapboxWorldMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

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

  // Fetch Mapbox token from Supabase Edge Function
  const fetchMapboxToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) throw error;
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
    if (!mapContainer.current || map.current) return;

    const token = await fetchMapboxToken();
    if (!token) {
      console.error('No Mapbox token available');
      return;
    }

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      zoom: 2,
      center: [0, 30],
      projection: 'globe',
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setIsMapInitialized(true);
      
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Loading map data...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Global Milk Test Activity Map</h2>
        <p className="text-lg text-gray-600">
          {countryData.length} countries with {totalTests.toLocaleString()} total tests
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc2626' }}></div>
          <span className="text-sm font-medium">100+ tests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ea580c' }}></div>
          <span className="text-sm font-medium">50-99 tests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
          <span className="text-sm font-medium">20-49 tests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }}></div>
          <span className="text-sm font-medium">10-19 tests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#84cc16' }}></div>
          <span className="text-sm font-medium">5-9 tests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }}></div>
          <span className="text-sm font-medium">1-4 tests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-300"></div>
          <span className="text-sm font-medium">No data</span>
        </div>
      </div>

      {/* Mapbox Map */}
      <div className="w-full h-[600px] rounded-lg border border-gray-200 shadow-lg overflow-hidden">
        <div ref={mapContainer} className="w-full h-full" />
      </div>

      {/* Top Countries Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {countryData.slice(0, 10).map((country, index) => (
          <div
            key={country.country_code}
            className="bg-white p-4 rounded-lg border-2 text-center shadow-sm hover:shadow-md transition-shadow"
            style={{ borderColor: getCountryColor(country.test_count) }}
          >
            <div className="text-lg font-bold mb-1" style={{ color: getCountryColor(country.test_count) }}>
              #{index + 1} {country.country_code}
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {country.test_count}
            </div>
            <div className="text-xs text-gray-500">
              {country.test_count === 1 ? 'test' : 'tests'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapboxWorldMap;