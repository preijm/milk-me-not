import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface CountryTestCount {
  country_code: string;
  test_count: number;
}

const WorldMapVisualization = () => {
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

  const getCountryColor = (countryCode: string): string => {
    const country = countryData.find(c => c.country_code === countryCode);
    if (!country) return '#e5e7eb'; // Gray for no data
    
    const testCount = country.test_count;
    if (testCount >= 100) return '#dc2626'; // Red - Very High
    if (testCount >= 50) return '#ea580c'; // Orange - High
    if (testCount >= 20) return '#d97706'; // Amber - Medium-High
    if (testCount >= 10) return '#eab308'; // Yellow - Medium
    if (testCount >= 5) return '#65a30d'; // Lime - Low-Medium
    if (testCount >= 1) return '#16a34a'; // Green - Low
    return '#e5e7eb'; // Gray for no data
  };

  const getCountryTestCount = (countryCode: string): number => {
    const country = countryData.find(c => c.country_code === countryCode);
    return country ? country.test_count : 0;
  };

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
          <span className="text-sm">100+ tests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ea580c' }}></div>
          <span className="text-sm">50-99 tests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#d97706' }}></div>
          <span className="text-sm">20-49 tests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }}></div>
          <span className="text-sm">10-19 tests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#65a30d' }}></div>
          <span className="text-sm">5-9 tests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#16a34a' }}></div>
          <span className="text-sm">1-4 tests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-300"></div>
          <span className="text-sm">No data</span>
        </div>
      </div>

      {/* World Map SVG */}
      <div className="w-full overflow-x-auto">
        <svg 
          viewBox="0 0 1000 500" 
          className="w-full h-auto min-h-[400px] max-h-[600px] border border-gray-200 rounded-lg bg-blue-50"
        >
          {/* Netherlands */}
          <g>
            <path
              d="M520 180 L535 180 L535 195 L520 195 Z"
              fill={getCountryColor('NL')}
              stroke="#fff"
              strokeWidth="1"
              className="hover:stroke-2 cursor-pointer"
            >
              <title>Netherlands: {getCountryTestCount('NL')} tests</title>
            </path>
          </g>

          {/* Germany */}
          <g>
            <path
              d="M530 190 L560 190 L560 220 L530 220 Z"
              fill={getCountryColor('DE')}
              stroke="#fff"
              strokeWidth="1"
              className="hover:stroke-2 cursor-pointer"
            >
              <title>Germany: {getCountryTestCount('DE')} tests</title>
            </path>
          </g>

          {/* France */}
          <g>
            <path
              d="M500 200 L530 200 L530 235 L500 235 Z"
              fill={getCountryColor('FR')}
              stroke="#fff"
              strokeWidth="1"
              className="hover:stroke-2 cursor-pointer"
            >
              <title>France: {getCountryTestCount('FR')} tests</title>
            </path>
          </g>

          {/* Belgium */}
          <g>
            <path
              d="M515 185 L530 185 L530 200 L515 200 Z"
              fill={getCountryColor('BE')}
              stroke="#fff"
              strokeWidth="1"
              className="hover:stroke-2 cursor-pointer"
            >
              <title>Belgium: {getCountryTestCount('BE')} tests</title>
            </path>
          </g>

          {/* United Kingdom */}
          <g>
            <path
              d="M480 170 L510 170 L510 200 L480 200 Z"
              fill={getCountryColor('GB')}
              stroke="#fff"
              strokeWidth="1"
              className="hover:stroke-2 cursor-pointer"
            >
              <title>United Kingdom: {getCountryTestCount('GB')} tests</title>
            </path>
          </g>

          {/* Switzerland */}
          <g>
            <path
              d="M530 210 L545 210 L545 225 L530 225 Z"
              fill={getCountryColor('CH')}
              stroke="#fff"
              strokeWidth="1"
              className="hover:stroke-2 cursor-pointer"
            >
              <title>Switzerland: {getCountryTestCount('CH')} tests</title>
            </path>
          </g>

          {/* Austria */}
          <g>
            <path
              d="M545 210 L570 210 L570 225 L545 225 Z"
              fill={getCountryColor('AT')}
              stroke="#fff"
              strokeWidth="1"
              className="hover:stroke-2 cursor-pointer"
            >
              <title>Austria: {getCountryTestCount('AT')} tests</title>
            </path>
          </g>

          {/* Italy */}
          <g>
            <path
              d="M530 225 L560 225 L555 260 L535 260 Z"
              fill={getCountryColor('IT')}
              stroke="#fff"
              strokeWidth="1"
              className="hover:stroke-2 cursor-pointer"
            >
              <title>Italy: {getCountryTestCount('IT')} tests</title>
            </path>
          </g>

          {/* Spain */}
          <g>
            <path
              d="M470 235 L500 235 L500 265 L470 265 Z"
              fill={getCountryColor('ES')}
              stroke="#fff"
              strokeWidth="1"
              className="hover:stroke-2 cursor-pointer"
            >
              <title>Spain: {getCountryTestCount('ES')} tests</title>
            </path>
          </g>

          {/* Croatia */}
          <g>
            <path
              d="M570 215 L590 215 L590 235 L570 235 Z"
              fill={getCountryColor('HR')}
              stroke="#fff"
              strokeWidth="1"
              className="hover:stroke-2 cursor-pointer"
            >
              <title>Croatia: {getCountryTestCount('HR')} tests</title>
            </path>
          </g>

          {/* United States */}
          <g>
            <path
              d="M100 180 L300 180 L300 280 L100 280 Z"
              fill={getCountryColor('US')}
              stroke="#fff"
              strokeWidth="1"
              className="hover:stroke-2 cursor-pointer"
            >
              <title>United States: {getCountryTestCount('US')} tests</title>
            </path>
          </g>

          {/* Canada */}
          <g>
            <path
              d="M100 120 L350 120 L350 180 L100 180 Z"
              fill={getCountryColor('CA')}
              stroke="#fff"
              strokeWidth="1"
              className="hover:stroke-2 cursor-pointer"
            >
              <title>Canada: {getCountryTestCount('CA')} tests</title>
            </path>
          </g>

          {/* Australia */}
          <g>
            <path
              d="M750 350 L850 350 L850 400 L750 400 Z"
              fill={getCountryColor('AU')}
              stroke="#fff"
              strokeWidth="1"
              className="hover:stroke-2 cursor-pointer"
            >
              <title>Australia: {getCountryTestCount('AU')} tests</title>
            </path>
          </g>

          {/* Brazil */}
          <g>
            <path
              d="M300 300 L400 300 L400 400 L300 400 Z"
              fill={getCountryColor('BR')}
              stroke="#fff"
              strokeWidth="1"
              className="hover:stroke-2 cursor-pointer"
            >
              <title>Brazil: {getCountryTestCount('BR')} tests</title>
            </path>
          </g>

          {/* Russia */}
          <g>
            <path
              d="M600 130 L900 130 L900 200 L600 200 Z"
              fill={getCountryColor('RU')}
              stroke="#fff"
              strokeWidth="1"
              className="hover:stroke-2 cursor-pointer"
            >
              <title>Russia: {getCountryTestCount('RU')} tests</title>
            </path>
          </g>

          {/* China */}
          <g>
            <path
              d="M700 200 L800 200 L800 260 L700 260 Z"
              fill={getCountryColor('CN')}
              stroke="#fff"
              strokeWidth="1"
              className="hover:stroke-2 cursor-pointer"
            >
              <title>China: {getCountryTestCount('CN')} tests</title>
            </path>
          </g>

          {/* India */}
          <g>
            <path
              d="M650 260 L700 260 L700 320 L650 320 Z"
              fill={getCountryColor('IN')}
              stroke="#fff"
              strokeWidth="1"
              className="hover:stroke-2 cursor-pointer"
            >
              <title>India: {getCountryTestCount('IN')} tests</title>
            </path>
          </g>

          {/* Japan */}
          <g>
            <path
              d="M820 220 L850 220 L850 250 L820 250 Z"
              fill={getCountryColor('JP')}
              stroke="#fff"
              strokeWidth="1"
              className="hover:stroke-2 cursor-pointer"
            >
              <title>Japan: {getCountryTestCount('JP')} tests</title>
            </path>
          </g>

          {/* Country Labels for high-activity countries */}
          {countryData.filter(c => c.test_count >= 10).map(country => {
            const positions: Record<string, [number, number]> = {
              'NL': [527, 187],
              'DE': [545, 205],
              'FR': [515, 217],
              'BE': [522, 192],
              'GB': [495, 185],
              'US': [200, 230],
              'CA': [225, 150],
            };
            
            const [x, y] = positions[country.country_code] || [0, 0];
            if (x === 0) return null;
            
            return (
              <text
                key={country.country_code}
                x={x}
                y={y}
                textAnchor="middle"
                className="text-xs font-bold fill-white"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                {country.country_code}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Top Countries List */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {countryData.slice(0, 10).map((country, index) => (
          <div
            key={country.country_code}
            className="bg-white p-3 rounded-lg border border-gray-200 text-center shadow-sm"
          >
            <div className="text-lg font-bold mb-1" style={{ color: getCountryColor(country.country_code) }}>
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

export default WorldMapVisualization;