import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CountryTestCount {
  country_code: string;
  test_count: number;
}

const MilkTestsMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
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

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      zoom: 2,
      center: [0, 30],
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      setIsMapInitialized(true);
    });
  };

  const addDataToMap = () => {
    if (!map.current || !isMapInitialized || !countryData.length) return;

    // Create a feature collection for country data
    const features = countryData.map(country => ({
      type: 'Feature' as const,
      properties: {
        country: country.country_code,
        testCount: country.test_count,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: getCountryCoordinates(country.country_code),
      },
    }));

    const geojsonData = {
      type: 'FeatureCollection' as const,
      features,
    };

    // Add source
    if (!map.current.getSource('test-counts')) {
      map.current.addSource('test-counts', {
        type: 'geojson',
        data: geojsonData,
      });

      // Add circle layer
      map.current.addLayer({
        id: 'test-counts-circles',
        type: 'circle',
        source: 'test-counts',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'testCount'],
            1, 8,
            10, 15,
            50, 25,
            100, 35,
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'testCount'],
            1, '#00BF63',
            10, '#2144ff',
            50, '#ff6b35',
            100, '#ff0066',
          ],
          'circle-opacity': 0.7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Add labels
      map.current.addLayer({
        id: 'test-counts-labels',
        type: 'symbol',
        source: 'test-counts',
        layout: {
          'text-field': ['concat', ['get', 'country'], '\n', ['get', 'testCount'], ' tests'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-anchor': 'center',
          'text-offset': [0, 2],
        },
        paint: {
          'text-color': '#333333',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1,
        },
      });

      // Add popup on click
      map.current.on('click', 'test-counts-circles', (e) => {
        if (e.features && e.features[0]) {
          const feature = e.features[0];
          const coordinates = (feature.geometry as any).coordinates.slice();
          const country = feature.properties?.country;
          const testCount = feature.properties?.testCount;

          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div class="p-2">
                <h3 class="font-bold text-lg">${country}</h3>
                <p class="text-sm">${testCount} milk tests recorded</p>
              </div>
            `)
            .addTo(map.current!);
        }
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'test-counts-circles', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'test-counts-circles', () => {
        map.current!.getCanvas().style.cursor = '';
      });
    }
  };

  // Simple country code to coordinates mapping (you might want to use a more comprehensive dataset)
  const getCountryCoordinates = (countryCode: string): [number, number] => {
    const coordinates: Record<string, [number, number]> = {
      'US': [-95.7129, 37.0902],
      'GB': [-3.4360, 55.3781],
      'DE': [10.4515, 51.1657],
      'FR': [2.2137, 46.2276],
      'IT': [12.5674, 41.8719],
      'ES': [-3.7492, 40.4637],
      'NL': [5.2913, 52.1326],
      'BE': [4.4699, 50.5039],
      'CH': [8.2275, 46.8182],
      'AT': [14.5501, 47.5162],
      'SE': [18.6435, 60.1282],
      'NO': [9.5018, 60.4720],
      'DK': [9.5018, 56.2639],
      'FI': [25.7482, 61.9241],
      'CA': [-106.3468, 56.1304],
      'AU': [133.7751, -25.2744],
      'JP': [138.2529, 36.2048],
      'BR': [-51.9253, -14.2350],
      'MX': [-102.5528, 23.6345],
      'IN': [78.9629, 20.5937],
      'CN': [104.1954, 35.8617],
      'RU': [105.3188, 61.5240],
      'ZA': [22.9375, -30.5595],
      'EG': [30.8025, 26.8206],
      'KE': [37.9062, -0.0236],
      'NG': [8.6753, 9.0820],
      'AR': [-63.6167, -38.4161],
      'CL': [-71.5430, -35.6751],
      'PE': [-75.0152, -9.1900],
      'CO': [-74.2973, 4.5709],
      'VE': [-66.5897, 6.4238],
      'TH': [100.9925, 15.8700],
      'VN': [108.2772, 14.0583],
      'MY': [101.9758, 4.2105],
      'SG': [103.8198, 1.3521],
      'ID': [113.9213, -0.7893],
      'PH': [121.7740, 12.8797],
      'KR': [127.7669, 35.9078],
      'TR': [35.2433, 38.9637],
      'GR': [21.8243, 39.0742],
      'PL': [19.1343, 51.9194],
      'CZ': [15.4730, 49.8175],
      'HU': [19.5033, 47.1625],
      'RO': [24.9668, 45.9432],
      'BG': [25.4858, 42.7339],
      'HR': [15.2000, 45.1000],
      'SI': [14.9955, 46.1512],
      'SK': [19.6990, 48.6690],
      'LT': [23.8813, 55.1694],
      'LV': [24.6032, 56.8796],
      'EE': [25.0136, 58.5953],
      'IE': [-8.2439, 53.4129],
      'PT': [-8.2245, 39.3999],
      'LU': [6.1296, 49.8153],
      'MT': [14.3754, 35.9375],
      'CY': [33.4299, 35.1264],
      'IS': [-19.0208, 64.9631],
      'MC': [7.4167, 43.7333],
      'AD': [1.5218, 42.5063],
      'SM': [12.4578, 43.9424],
      'VA': [12.4534, 41.9029],
      'LI': [9.5215, 47.1410],
    };
    
    return coordinates[countryCode] || [0, 0];
  };

  useEffect(() => {
    if (mapboxToken) {
      initializeMap();
    }
  }, [mapboxToken]);

  useEffect(() => {
    addDataToMap();
  }, [isMapInitialized, countryData]);

  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Loading map data...</div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <Alert className="mb-4">
          <AlertDescription>
            To display the map, please enter your Mapbox public token. You can get one from{' '}
            <a 
              href="https://mapbox.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              mapbox.com
            </a>
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
          <Input
            id="mapbox-token"
            type="text"
            placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwi..."
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
          />
          <p className="text-sm text-gray-600">
            Go to Mapbox, create an account, and find your public token in the Tokens section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Milk Tests by Country</h2>
        <p className="text-gray-600">
          {countryData.length} countries with {countryData.reduce((sum, country) => sum + country.test_count, 0)} total tests
        </p>
      </div>
      <div ref={mapContainer} className="w-full h-[600px] rounded-lg shadow-lg border border-gray-200" />
    </div>
  );
};

export default MilkTestsMap;