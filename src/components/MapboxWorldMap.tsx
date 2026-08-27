import React, { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
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

/** The denominator behind "x% of the world". Sovereign states, roughly. */
const COUNTRIES_IN_THE_WORLD = 195;

/**
 * ISO country code to a readable name.
 *
 * This used to read the `countries` table, but that table is closed to
 * anonymous visitors, so once the map stopped requiring an account every
 * signed-out reader saw "DE is the softest touch". The browser already knows
 * every one of these names and cannot fail to load them.
 */
const regionNames = (() => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' });
  } catch {
    return null;
  }
})();

const countryName = (code: string) => {
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code; // Not a valid region code — show it raw rather than throwing.
  }
};

/**
 * The host a URL points at, or empty when it is not a URL at all.
 *
 * Mapbox hands error URLs through as strings, and a substring test on those is
 * the sort of thing that looks fine until a host is spelled somewhere it does
 * not belong.
 */
const hostOf = (url: string | undefined): string => {
  if (!url) return '';
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
};

/** Touch and stylus, as opposed to a mouse — what decides the gesture rules. */
const isCoarsePointer = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: coarse)').matches;

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

  const totalCountries = COUNTRIES_IN_THE_WORLD;

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


  /**
   * A zoom at which the whole globe fits the card.
   *
   * In globe projection the sphere is `512 * 2^zoom / π` pixels across, so a
   * fixed zoom shows a different amount of planet in every window — at zoom 2
   * the globe is 652px wide and the card is 416px tall on a phone, which is
   * why it was arriving cropped at the top and bottom.
   *
   * Solving that for the height we have, less a margin so the globe sits in
   * the card rather than touching it, gives a planet on the page at any size.
   */
  const fitZoomForHeight = (heightPx: number) => {
    const GLOBE_PX_AT_ZOOM_0 = 512 / Math.PI;
    const target = heightPx * 0.86;
    const zoom = Math.log2(target / GLOBE_PX_AT_ZOOM_0);
    // Clamped so a freak container size cannot send the camera somewhere absurd.
    return Math.min(2.2, Math.max(0.6, zoom));
  };

  // Interpolate between colors for smooth heatmap gradient (grey to green)
  const interpolateColor = (value: number, min: number, max: number): string => {
    // Normalize value between 0 and 1 using logarithmic scale for better distribution
    const normalized = Math.log(value + 1) / Math.log(max + 1);
    const clamped = Math.max(0, Math.min(1, normalized));
    
    // From --story-cream-3 to --story-green: unrated land is the palette's
    // quietest paper rather than Tailwind's grey-200, which belonged to
    // nothing here.
    const grey = [222, 231, 224];  // #dee7e0 — hsl(140 15% 88%)
    const green = [0, 191, 99];    // #00bf63 — hsl(151 100% 37.45%)
    
    const r = Math.round(grey[0] + clamped * (green[0] - grey[0]));
    const g = Math.round(grey[1] + clamped * (green[1] - grey[1]));
    const b = Math.round(grey[2] + clamped * (green[2] - grey[2]));
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getCountryColor = (testCount: number): string => {
    if (testCount === 0) return '#dee7e0'; // --story-cream-3: reported by nobody yet
    
    // Find max for scaling (use 150 as reasonable max for good distribution)
    const maxForScale = 150;
    return interpolateColor(testCount, 1, maxForScale);
  };

  const initializeMap = async () => {
    
    if (!mapContainer.current || map.current) {
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
    
    if (!token) {
      console.error('No Mapbox token available');
      setMapError('The map is not configured yet — no Mapbox public token is set for this app.');
      return;
    }

    // Guard: Mapbox GL JS expects a public token (pk.*)
    if (!token.startsWith('pk.')) {
      setMapError('Invalid Mapbox token format. Please use a public token that starts with “pk.”');
      return;
    }

    try {
      mapboxgl.accessToken = token;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        zoom: fitZoomForHeight(mapContainer.current.clientHeight),
        center: [0, 30],
        projection: 'globe',
        attributionControl: false,
        // A full-width map inside a scrolling page swallows the swipe that was
        // meant to scroll past it. On touch this asks for two fingers to pan,
        // which hands single-finger scrolling back to the page; the zoom
        // buttons still work for anyone who does not discover that.
        cooperativeGestures: isCoarsePointer(),
      });

      // Add compact attribution control (no duplicates, no "Improve this map" link)
      map.current.addControl(new mapboxgl.AttributionControl({
        compact: true,
      }), 'bottom-right');


      // A blank map with no explanation is worse than an error, so give up
      // eventually — but measure silence, not elapsed time.
      //
      // This was a flat 12s deadline from construction. On a slow connection a
      // map that is downloading steadily would be declared broken and replaced
      // with "Try again" mid-download, and retrying only restarts the same
      // slow fetch. What actually distinguishes a stalled map from a slow one
      // is whether anything is still arriving, and Mapbox says so: `dataloading`
      // and `data` fire for the style, each source and every tile.
      //
      // So the clock resets on progress. A map trickling in over a minute on
      // bad mobile data never trips it; one that fetches its style and then
      // stops dead still reports in twelve seconds.
      const STALL_MS = 12000;
      // The watchdog covers the first load only. `data` keeps firing for the
      // life of the map — every tile fetched while panning — so leaving it
      // armed afterwards would put an error over a working map the moment the
      // reader sat still for twelve seconds.
      let loaded = false;
      const armStallTimer = () => {
        if (loaded) return;
        if (loadTimeoutRef.current) window.clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = window.setTimeout(() => {
          console.error(`MapboxWorldMap: no map data for ${STALL_MS}ms — treating as stalled`);
          setMapError('Map took too long to load. Please retry or check your network connection.');
        }, STALL_MS);
      };
      const stopStallTimer = () => {
        loaded = true;
        if (loadTimeoutRef.current) {
          window.clearTimeout(loadTimeoutRef.current);
          loadTimeoutRef.current = null;
        }
        map.current?.off('dataloading', armStallTimer);
        map.current?.off('data', armStallTimer);
      };
      armStallTimer();

      // Any sign of life pushes the deadline back.
      map.current.on('dataloading', armStallTimer);
      map.current.on('data', armStallTimer);

      // Mapbox emits `error` for anything that went wrong, most of which the
      // map survives. Treating all of it as fatal meant one blocked analytics
      // request covered a working globe with an apology — and every reader
      // running an ad blocker got that, because they all stop
      // `events.mapbox.com`.
      map.current.on('error', (e) => {
        const err = (e as { error?: Error & { status?: number; url?: string } }).error;

        // Telemetry. Blocked constantly, and the map does not depend on it.
        // Compared as a host rather than with includes(), which would also
        // match https://anything/?redirect=events.mapbox.com and swallow a
        // real failure.
        if (hostOf(err?.url) === 'events.mapbox.com') return;

        console.error('Mapbox error:', err ?? e);

        // A token that cannot fetch what it asked for will never recover, and
        // the stall watchdog would blame the network twelve seconds later.
        // Say which token problem it is instead: this exact 403 cost an
        // evening once, with "check the browser console" as the only clue.
        if (err?.status === 401 || err?.status === 403) {
          stopStallTimer();
          setMapError(
            'The Mapbox token cannot load map tiles — it is missing the styles:tiles scope, or it is restricted to other domains.',
          );
          return;
        }

        // Anything else is a tile, a sprite, a font. If the map is already
        // drawn, hiding it behind an error is worse than the missing piece;
        // if it never draws, the stall watchdog is what says so.
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        stopStallTimer();
        setIsMapInitialized(true);
        setMapError(null);
        
        // Add atmosphere for globe
        if (map.current) {
          // Mapbox's stock night sky — near-black space, electric blue
          // atmosphere — was the only dark rectangle on a cream site, so the
          // map read as a window into a different application. Its
          // `high-color` was rgb(36,92,223), within a shade of the old design
          // system's #2144ff, which this redesign spent its time removing.
          //
          // Cream space instead: the globe sits on the page like the charts
          // rather than punching a hole in it, and the green shading — the
          // only thing here carrying data — stops competing with a blue glow.
          // Stars go with the darkness; there is no night left to see them
          // against.
          map.current.setFog({
            color: 'hsl(145, 68%, 95%)',        // --story-green-wash, horizon haze
            // --story-green at full strength drew a rim brighter than the
            // countries it framed — only Germany matched it, so the loudest
            // thing on a map about ratings was its own edge. Same hue, pulled
            // back: still definite against the cream, no longer competing
            // with the data.
            'high-color': 'hsl(151, 70%, 55%)',
            // 0.03 is where this started, when the atmosphere was
            // --story-green-light and the edge was mush. Raising the blend to
            // 0.09 and the colour together overshot twice: the haze filled a
            // third of the card and outshone the countries it was meant to
            // frame, and Mapbox's fog dithers into visible rings at that
            // width. The colour was the half worth keeping — full green at
            // this tightness is a rim rather than a cloud.
            'horizon-blend': 0.03,
            'space-color': 'hsl(135, 29%, 97%)', // --story-cream, same ground as the page
            'star-intensity': 0,
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
      const country = countryData.find((c) => c.country_code === countryCode);
      const testCount = country ? country.test_count : 0;

      // `properties.name` is the country's name in its own language, so this
      // popup was the one place on an English page that said "Deutschland".
      // The page-wide helper is used everywhere else; a local `const
      // countryName` here had been shadowing it.
      const label = countryCode ? countryName(countryCode) : (properties?.name ?? 'Unknown');

      const popup = document.createElement('div');
      popup.className = 'map-popup';

      const name = document.createElement('h3');
      name.className = 'map-popup__name';
      name.textContent = label;

      const count = document.createElement('p');
      count.className = 'map-popup__count';
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
        // Skipping the count-up means landing on the final number immediately.
        // Deriving it instead would mean calling prefersReducedMotion() during
        // render, which reads a media query — impure, and a worse trade than
        // this one line. The animating branch below sets state from a timer,
        // which the rule allows.
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
        <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-story-muted-2">None</span>
        <span
          aria-hidden
          className="h-2 w-full max-w-xs rounded-full"
          // The same two stops the map interpolates between, so the key
          // describes the thing it sits above rather than approximating it.
          style={{ background: 'linear-gradient(to right, #dee7e0, #00bf63)' }}
        />
        <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-story-muted-2">Most</span>
      </div>

      <div className="story-hairline relative mt-5 h-104 w-full overflow-hidden rounded-[1.25rem] sm:h-136">
        <div ref={mapContainer} className="h-full w-full" />

        {(isLoading || isInitializing) && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-story-cream/80 backdrop-blur-xs">
            <p className="text-[0.9375rem] font-medium text-story-muted">
              {isLoading ? 'Loading map data…' : 'Waking the globe up…'}
            </p>
          </div>
        )}

        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-story-cream/90 p-6 backdrop-blur-xs">
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
                    <span className="story-num w-5 shrink-0 text-[0.8125rem] tabular-nums text-story-muted-2">
                      {index + 1}
                    </span>
                    <span className="truncate text-[0.9375rem] font-bold text-story-ink">
                      {countryName(country.country_code)}
                    </span>
                  </span>
                  <span className="relative flex shrink-0 items-baseline gap-4 pl-3 sm:gap-6">
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