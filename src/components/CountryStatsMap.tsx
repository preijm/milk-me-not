import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CountryTestCount {
  country_code: string;
  test_count: number;
}

const CountryStatsMap = () => {
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
      
      return Object.entries(counts)
        .map(([country_code, test_count]) => ({
          country_code,
          test_count
        }))
        .sort((a, b) => b.test_count - a.test_count) as CountryTestCount[];
    },
  });

  const getCountryName = (countryCode: string): string => {
    const countryNames: Record<string, string> = {
      'US': 'United States',
      'GB': 'United Kingdom',
      'DE': 'Germany',
      'FR': 'France',
      'IT': 'Italy',
      'ES': 'Spain',
      'NL': 'Netherlands',
      'BE': 'Belgium',
      'CH': 'Switzerland',
      'AT': 'Austria',
      'SE': 'Sweden',
      'NO': 'Norway',
      'DK': 'Denmark',
      'FI': 'Finland',
      'CA': 'Canada',
      'AU': 'Australia',
      'JP': 'Japan',
      'BR': 'Brazil',
      'MX': 'Mexico',
      'IN': 'India',
      'CN': 'China',
      'RU': 'Russia',
      'ZA': 'South Africa',
      'EG': 'Egypt',
      'KE': 'Kenya',
      'NG': 'Nigeria',
      'AR': 'Argentina',
      'CL': 'Chile',
      'PE': 'Peru',
      'CO': 'Colombia',
      'VE': 'Venezuela',
      'TH': 'Thailand',
      'VN': 'Vietnam',
      'MY': 'Malaysia',
      'SG': 'Singapore',
      'ID': 'Indonesia',
      'PH': 'Philippines',
      'KR': 'South Korea',
      'TR': 'Turkey',
      'GR': 'Greece',
      'PL': 'Poland',
      'CZ': 'Czech Republic',
      'HU': 'Hungary',
      'RO': 'Romania',
      'BG': 'Bulgaria',
      'HR': 'Croatia',
      'SI': 'Slovenia',
      'SK': 'Slovakia',
      'LT': 'Lithuania',
      'LV': 'Latvia',
      'EE': 'Estonia',
      'IE': 'Ireland',
      'PT': 'Portugal',
      'LU': 'Luxembourg',
      'MT': 'Malta',
      'CY': 'Cyprus',
      'IS': 'Iceland',
    };
    
    return countryNames[countryCode] || countryCode;
  };

  const getBadgeVariant = (testCount: number) => {
    if (testCount >= 50) return 'default'; // High activity
    if (testCount >= 20) return 'secondary'; // Medium activity
    if (testCount >= 10) return 'outline'; // Low activity
    return 'outline'; // Very low activity
  };

  const getActivityLevel = (testCount: number) => {
    if (testCount >= 50) return 'High Activity';
    if (testCount >= 20) return 'Medium Activity';
    if (testCount >= 10) return 'Low Activity';
    return 'Very Low Activity';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Loading country statistics...</div>
      </div>
    );
  }

  const totalTests = countryData.reduce((sum, country) => sum + country.test_count, 0);
  const topCountries = countryData.slice(0, 10);
  const otherCountries = countryData.slice(10);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Global Milk Test Activity</h2>
        <p className="text-lg text-gray-600">
          {countryData.length} countries with {totalTests.toLocaleString()} total tests
        </p>
      </div>

      {/* Top Countries Grid */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Top Testing Countries</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {topCountries.map((country, index) => (
            <Card key={country.country_code} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  <Badge variant={getBadgeVariant(country.test_count)}>
                    {getActivityLevel(country.test_count)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1" style={{ color: '#00BF63' }}>
                    {country.country_code}
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    {getCountryName(country.country_code)}
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {country.test_count}
                  </div>
                  <div className="text-xs text-gray-500">
                    {country.test_count === 1 ? 'test' : 'tests'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Other Countries */}
      {otherCountries.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Other Countries</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {otherCountries.map((country) => (
              <div
                key={country.country_code}
                className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-center"
              >
                <div className="text-lg font-bold text-gray-700 mb-1">
                  {country.country_code}
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  {getCountryName(country.country_code)}
                </div>
                <div className="text-sm font-semibold" style={{ color: '#2144ff' }}>
                  {country.test_count} {country.test_count === 1 ? 'test' : 'tests'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryStatsMap;
