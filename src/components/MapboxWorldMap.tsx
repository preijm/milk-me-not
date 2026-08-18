import React, { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { StoryButton } from '@/components/story';
import { prefersReducedMotion } from '@/lib/motion';
import { useRatingFacts } from '@/hooks/useRatingFacts';
import { countryStats, MIN_RATINGS_PER_COUNTRY, type CountryStat } from '@/components/results/chartData';
import { ResultsPanel } from '@/components/results/ResultsPanel';

/**
 * The distance between two averages, measured on the numbers as printed.
 *
 * Subtracting first and rounding after gives a sentence that argues with the
 * figures beside it — 7.75 and 7.33 show as 7.8 and 7.3 but read as 0.4 apart.
 */
const gap = (low: number, high: number) => (Number(high.toFixed(1)) - Number(low.toFixed(1))).toFixed(1);

const MapboxWorldMap = ({ visibleProductIds }: { visibleProductIds: Set<string> }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const initAttempted = useRef(false);
  const loadTimeoutRef = useRef<number | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  // Counted from the same ratings the ranking and the charts are showing, so
  // search and the filters reach the map too.
  const { data: facts = [], isLoading } = useRatingFacts();
  const countryData: CountryStat[] = useMemo(
    () => countryStats(facts.filter((f) => f.product_id && visibleProductIds.has(f.product_id))),
    [facts, visibleProductIds],
  );

  // Only countries with enough ratings get to stand for a national palate.
  const judged = useMemo(
    () => [...countryData].filter((c) => c.test_count >= MIN_RATINGS_PER_COUNTRY).sort((a, b) => a.avg - b.avg),
    [countryData],
  );

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
  /** The country list may not have loaded yet, so the code stands in. */
  const countryName = (code: string) => countryCodeToName.get(code) || code;
  const totalCountries = countriesData.length || 195;

  // Read Mapbox public token from environment.
  // Accepts either the Mapbox connector's injected token or a manually set env var.
  // Public tokens (pk.*) are designed for client-side use and should be URL-restricted
  // in the Mapbox dashboard to your domains for quota protection.
  const getMapboxToken = (): string | null => {
    const token =
      import.meta.env.VITE_LOVABLE_CONNECTOR_MAPBOX_PUBLIC_TOKEN ||
      import.meta.env.VITE_MAPBOX_PUBLIC_KEY;
    if (!token) {
      console.error('MapboxWorldMap: no Mapbox public token found in environment');
      return null;
    }
    return token;
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

    const token = getMapboxToken();
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

      // Add rotation. It re-arms itself on every moveend, so for someone who
      // has asked for reduced motion this is a globe that never stops turning —
      // opt them out entirely rather than slowing it down.
      let userInteracting = false;
      const spinGlobe = () => {
        if (!map.current || prefersReducedMotion()) return;
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

      // Raw HTML sits outside React and Tailwind, so the story palette comes in
      // as literals here — the same compromise `tiers.ts` makes for SVG fills.
      const popup = document.createElement('div');
      popup.style.cssText = 'padding:14px 16px;min-width:150px';

      const name = document.createElement('h3');
      name.style.cssText = 'font-weight:800;font-size:17px;margin:0 0 6px;color:#1b2421;letter-spacing:-0.01em';
      name.textContent = countryName || countryCode || 'Unknown';

      const count = document.createElement('p');
      count.style.cssText = 'font-size:14px;font-weight:600;margin:0;color:#5d6b65';
      count.textContent = `${testCount} ${testCount === 1 ? 'rating' : 'ratings'}`;

      popup.append(name, count);

      new mapboxgl.Popup({ closeButton: true, className: 'custom-popup' })
        .setLngLat(e.lngLat)
        .setDOMContent(popup)
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
  // initializeMap is stable — omitting avoids re-creating map on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    if (isMapInitialized && countryData.length > 0) {
      addCountryData();
    }
  // addCountryData is stable — omitting avoids redundant map redraws
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapInitialized, countryData]);

  const totalTests = countryData.reduce((sum, country) => sum + country.test_count, 0);
  const discoveryPercentage = Math.round((countryData.length / totalCountries) * 100);

  // Animated counter effect
  useEffect(() => {
    if (discoveryPercentage > 0) {
      if (prefersReducedMotion()) {
        setAnimatedPercentage(discoveryPercentage);
        return;
      }
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
    <div className="flex w-full flex-col gap-5">
      <ResultsPanel
        kicker="Where it was drunk"
        title={`${countryData.length} ${countryData.length === 1 ? "country has" : "countries have"} put a carton on the board`}
        lede={
          <>
            That is {animatedPercentage}% of the world, which leaves rather a lot of shelves nobody has reported back
            on yet. Darker means more ratings.
          </>
        }
      >
      {/* Legend. The fill is a single-hue ramp, so the scale reads left to right. */}
      <div className="flex items-center gap-3">
        <span className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-story-muted-2">None</span>
        <span
          aria-hidden
          className="h-2 w-full max-w-xs rounded-full"
          style={{ background: 'linear-gradient(to right, #e5e7eb, #00bf63)' }}
        />
        <span className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-story-muted-2">Most</span>
      </div>

      <div className="story-hairline relative mt-5 h-[26rem] w-full overflow-hidden rounded-[1.25rem] sm:h-[34rem]">
        <div ref={mapContainer} className="h-full w-full" />

        {(isLoading || isInitializing) && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-story-cream/80 backdrop-blur-sm">
            <p className="text-[0.9375rem] font-medium text-story-muted">
              {isLoading ? 'Loading map data…' : 'Waking the globe up…'}
            </p>
          </div>
        )}

        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-story-cream/90 p-6 backdrop-blur-sm">
            <div className="max-w-md text-center">
              <p className="story-serif text-[1.125rem] font-bold text-story-ink">{mapError}</p>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-story-muted">
                Usually the network, occasionally the map service itself.
              </p>
              <StoryButton tone="green" size="sm" onClick={handleRetry} className="mt-5">
                <RefreshCw className="h-4 w-4" aria-hidden />
                Try again
              </StoryButton>
            </div>
          </div>
        )}
      </div>
      </ResultsPanel>

      {/* Country rankings. Separated by spacing and a tinted bar rather than
          divider rules, which the rest of the site does not use. */}
      <ResultsPanel
        kicker="Who is reporting back"
        title={
          judged.length >= 2
            ? `${countryName(judged[judged.length - 1].country_code)} is the softest touch`
            : "Where the ratings come from"
        }
        lede={
          judged.length >= 2 ? (
            <>
              The bar is each country's share of the ratings; the number beside it is what they score on average. Of
              the countries with at least {MIN_RATINGS_PER_COUNTRY} ratings,{" "}
              <strong className="font-bold text-story-ink">{countryName(judged[judged.length - 1].country_code)}</strong>{" "}
              averages {judged[judged.length - 1].avg.toFixed(1)} and{" "}
              <strong className="font-bold text-story-ink">{countryName(judged[0].country_code)}</strong>{" "}
              {judged[0].avg.toFixed(1)} — {gap(judged[0].avg, judged[judged.length - 1].avg)} of a point between the
              kindest crowd and the toughest.
            </>
          ) : (
            <>
              The bar is each country's share of the ratings; the number beside it is what they score on average. Too
              few countries have {MIN_RATINGS_PER_COUNTRY} ratings in this slice to compare palates yet.
            </>
          )
        }
      >
        <ol className="flex flex-col gap-1.5">
          {[...countryData]
            .sort((a, b) => b.test_count - a.test_count)
            .map((country, index) => {
              const percentage = totalTests ? (country.test_count / totalTests) * 100 : 0;
              return (
                <li
                  key={country.country_code}
                  className="relative flex items-center justify-between overflow-hidden rounded-xl px-3 py-2.5"
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 rounded-xl bg-story-green/[0.14]"
                    style={{ width: `${percentage}%` }}
                  />
                  <span className="relative flex min-w-0 items-center gap-3">
                    <span className="story-num w-5 flex-shrink-0 text-[0.8125rem] tabular-nums text-story-muted-2">
                      {index + 1}
                    </span>
                    <span className="truncate text-[0.9375rem] font-bold text-story-ink">
                      {countryName(country.country_code)}
                    </span>
                  </span>
                  <span className="relative flex flex-shrink-0 items-baseline gap-4 pl-3 sm:gap-6">
                    <span className="story-num w-10 text-right text-[0.9375rem] tabular-nums text-story-muted sm:w-12">
                      {country.test_count}
                    </span>
                    {/* Dimmed below the threshold: a mean of two ratings is a
                        number, not a verdict. */}
                    <span
                      className={`story-num w-9 text-right text-[1rem] tabular-nums sm:w-11 ${
                        country.test_count >= MIN_RATINGS_PER_COUNTRY ? "text-story-ink" : "text-story-muted-2"
                      }`}
                    >
                      {country.avg.toFixed(1)}
                    </span>
                  </span>
                </li>
              );
            })}
        </ol>

        <p className="mt-4 text-[0.8125rem] leading-relaxed text-story-muted">
          Ratings, then average score. Averages from fewer than {MIN_RATINGS_PER_COUNTRY} ratings are greyed — they
          move too much to mean anything yet.
        </p>
      </ResultsPanel>
    </div>
  );
};

export default MapboxWorldMap;